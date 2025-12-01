import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import twilio from "twilio";

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

export async function POST(request: NextRequest) {
  try {
    const twilioClient = getTwilioClient();
    const openai = getOpenAIClient();

    if (!twilioClient || !openai) {
      return new NextResponse("WhatsApp integration not configured", { status: 503 });
    }

    const formData = await request.formData();
    const from = formData.get("From") as string;
    const mediaUrl = formData.get("MediaUrl0") as string;
    const numMedia = parseInt(formData.get("NumMedia") as string || "0");

    if (!from) {
      return new NextResponse("Missing sender information", { status: 400 });
    }

    // If no image is sent
    if (numMedia === 0 || !mediaUrl) {
      await sendWhatsAppMessage(
        twilioClient,
        from,
        "👋 Welcome to Leftover Recipe AI!\n\nPlease send me an image of your leftover ingredients, and I'll generate 3 delicious recipes for you! 📸🍳"
      );
      return new NextResponse("OK", { status: 200 });
    }

    // Download image from Twilio
    const imageResponse = await fetch(mediaUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString("base64")}`,
      },
    });

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

    // Send processing message
    await sendWhatsAppMessage(
      twilioClient,
      from,
      "🔄 Analyzing your ingredients... I'll send you 3 amazing recipes in a moment!"
    );

    // Generate recipes using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image of leftover ingredients and generate EXACTLY 3 different creative recipes.

For each recipe, provide:
1. Recipe name
2. Brief description
3. Ingredients list
4. Cooking instructions
5. Cooking time
6. Difficulty level

Format as JSON array.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    let recipes;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recipes = JSON.parse(jsonMatch[0]);
      } else {
        recipes = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Failed to parse recipe data");
    }

    // Format and send recipes
    for (let i = 0; i < Math.min(3, recipes.length); i++) {
      const recipe = recipes[i];
      const message = formatRecipeMessage(recipe, i + 1);
      await sendWhatsAppMessage(twilioClient, from, message);
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await sendWhatsAppMessage(
      twilioClient,
      from,
      "✅ All recipes sent! Enjoy cooking! 👨‍🍳\n\nSend another image anytime for more recipes!"
    );

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);

    // Try to notify user of error
    try {
      const twilioClient = getTwilioClient();
      const formData = await request.formData();
      const from = formData.get("From") as string;
      if (from && twilioClient) {
        await sendWhatsAppMessage(
          twilioClient,
          from,
          "❌ Sorry, I encountered an error processing your image. Please try again or check if the image is clear."
        );
      }
    } catch (notifyError) {
      console.error("Failed to send error notification:", notifyError);
    }

    return new NextResponse("Error", { status: 500 });
  }
}

async function sendWhatsAppMessage(client: any, to: string, message: string) {
  if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    throw new Error("TWILIO_WHATSAPP_NUMBER not configured");
  }

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: to,
    body: message,
  });
}

function formatRecipeMessage(recipe: any, number: number): string {
  let message = `📋 *Recipe ${number}: ${recipe.name}*\n\n`;
  message += `${recipe.description}\n\n`;
  message += `⏱️ Time: ${recipe.cookingTime}\n`;
  message += `📊 Difficulty: ${recipe.difficulty}\n\n`;
  message += `*Ingredients:*\n`;
  recipe.ingredients.forEach((ing: string) => {
    message += `• ${ing}\n`;
  });
  message += `\n*Instructions:*\n`;
  recipe.instructions.forEach((inst: string, i: number) => {
    message += `${i + 1}. ${inst}\n`;
  });
  return message;
}

// Handle GET for webhook verification
export async function GET(request: NextRequest) {
  return new NextResponse("WhatsApp webhook is active", { status: 200 });
}
