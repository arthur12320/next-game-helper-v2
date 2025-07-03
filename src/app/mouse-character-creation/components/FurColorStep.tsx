/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

interface CharacterData {
  name: string
  furColor: string
  parentNames: {
    mother: string
    father: string
  }
}

interface FurColorStepProps {
  characterData: CharacterData
  updateCharacterData: (field: string, value: any) => void
}

const FUR_COLORS = [
  { name: "Brown", rarity: "Common", color: "#8B4513", description: "The most common fur color among mice" },
  { name: "Blonde", rarity: "Common", color: "#F5DEB3", description: "Light golden fur, quite popular" },
  { name: "Gray", rarity: "Common", color: "#808080", description: "Classic gray coloring" },
  { name: "Black", rarity: "Uncommon", color: "#2C2C2C", description: "Sleek black fur, less common" },
  { name: "White", rarity: "Uncommon", color: "#F8F8FF", description: "Pure white fur, uncommon but striking" },
  { name: "Red", rarity: "Rare", color: "#CD853F", description: "Reddish-brown fur, very rare and distinctive" },
]

export default function FurColorStep({ characterData, updateCharacterData }: FurColorStepProps) {
  const handleColorSelect = (colorName: string) => {
    updateCharacterData("furColor", colorName)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "text-green-600 bg-green-50"
      case "Uncommon":
        return "text-yellow-600 bg-yellow-50"
      case "Rare":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose a fur color for your mouse</h3>
        <p className="text-gray-600 mb-6">
          Brown is most common, followed by blonde and gray. Black and white are uncommon and red is rare.
        </p>
      </div>

      {/* Color Selection Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FUR_COLORS.map((furColor) => (
          <button
            key={furColor.name}
            onClick={() => handleColorSelect(furColor.name)}
            className={`border p-4 rounded-lg transition-all hover:shadow-md ${
              characterData.furColor === furColor.name
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: furColor.color }}
              ></div>
              <div className="text-left">
                <h4 className="font-medium">{furColor.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(furColor.rarity)}`}>
                  {furColor.rarity}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-left">{furColor.description}</p>
          </button>
        ))}
      </div>

      {/* Current Selection */}
      <div className="border-t pt-4">
        <p className="font-medium">
          Selected Fur Color: <span className="text-blue-600">{characterData.furColor || "None selected"}</span>
        </p>
        {characterData.furColor && (
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{
                backgroundColor: FUR_COLORS.find((c) => c.name === characterData.furColor)?.color,
              }}
            ></div>
            <span className="text-sm text-gray-600">
              {FUR_COLORS.find((c) => c.name === characterData.furColor)?.description}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
