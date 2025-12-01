import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image of leftover ingredients from a kitchen and generate EXACTLY 3 different creative recipes.

For each recipe, provide:
1. Recipe name (creative and appetizing)
2. Brief description (2-3 sentences)
3. List of ingredients (be specific with quantities)
4. Step-by-step cooking instructions
5. Estimated cooking time
6. Difficulty level (Easy/Medium/Hard)

Format your response as a valid JSON array with this exact structure:
[
  {
    "name": "Recipe Name",
    "description": "Brief description of the dish",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "instructions": ["step 1", "step 2", ...],
    "cookingTime": "XX minutes",
    "difficulty": "Easy|Medium|Hard"
  }
]

Make sure to generate 3 diverse recipes that use the ingredients shown in different ways. Focus on practical, delicious recipes that can be made with common kitchen items.`,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
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

    // Extract JSON from response
    let recipes;
    try {
      // Try to find JSON in the response
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

    // Ensure we have at least 3 recipes
    if (!Array.isArray(recipes) || recipes.length < 3) {
      throw new Error("Failed to generate 3 recipes");
    }

    return NextResponse.json({ recipes: recipes.slice(0, 3) });
  } catch (error) {
    console.error("Error generating recipes:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate recipes" },
      { status: 500 }
    );
  }
}
