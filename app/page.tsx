"use client";

import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import RecipeDisplay from "./components/RecipeDisplay";
import WhatsAppIntegration from "./components/WhatsAppIntegration";

export default function Home() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRecipesGenerated = (generatedRecipes: any[]) => {
    setRecipes(generatedRecipes);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            🍳 Leftover Recipe AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your leftover ingredients and get instant AI-generated recipe suggestions!
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">📸 Upload Image</h2>
            <ImageUploader
              onRecipesGenerated={handleRecipesGenerated}
              setLoading={setLoading}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">💬 WhatsApp Integration</h2>
            <WhatsAppIntegration />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">🍽️ Generated Recipes</h2>
          <RecipeDisplay recipes={recipes} loading={loading} />
        </div>
      </div>
    </main>
  );
}
