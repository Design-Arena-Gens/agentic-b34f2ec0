"use client";

interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  difficulty: string;
}

interface RecipeDisplayProps {
  recipes: Recipe[];
  loading: boolean;
}

export default function RecipeDisplay({ recipes, loading }: RecipeDisplayProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Analyzing your ingredients and generating recipes...</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>Upload an image to get recipe suggestions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recipes.map((recipe, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-800">{recipe.name}</h3>
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
              Recipe #{index + 1}
            </span>
          </div>

          <p className="text-gray-700 mb-4 italic">{recipe.description}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3">
              <span className="text-sm font-semibold text-gray-600">⏱️ Cooking Time:</span>
              <span className="ml-2 text-gray-800">{recipe.cookingTime}</span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="text-sm font-semibold text-gray-600">📊 Difficulty:</span>
              <span className="ml-2 text-gray-800">{recipe.difficulty}</span>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-lg text-gray-800 mb-2">🥗 Ingredients:</h4>
            <ul className="space-y-1 bg-white rounded-lg p-4">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="text-gray-700 flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-2">👨‍🍳 Instructions:</h4>
            <ol className="space-y-2 bg-white rounded-lg p-4">
              {recipe.instructions.map((instruction, i) => (
                <li key={i} className="text-gray-700 flex items-start">
                  <span className="font-semibold text-primary mr-2">{i + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </div>
  );
}
