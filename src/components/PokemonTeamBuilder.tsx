import React from 'react';
import { usePokemonAPI, type Team } from '../data/usePokemonAPI';

interface PokemonTeamBuilderProps {
  onSlotSelect?: (slot: number | null) => void;
  selectedSlot?: number | null;
  team: Team;
  error: string | null;
  removePokemonFromTeam: (position: number) => void;
  clearTeam: () => void;
  getTeamStats: () => { filledSlots: number; emptySlots: number; totalTypes: number; typeCoverage: number };
}

const PokemonTeamBuilder: React.FC<PokemonTeamBuilderProps> = ({ 
  onSlotSelect, 
  selectedSlot, 
  team,
  error,
  removePokemonFromTeam,
  clearTeam,
  getTeamStats
}) => {
  const stats = getTeamStats();

  const {getTypeColor} = usePokemonAPI();
  const handleSlotClick = (index: number) => {
    if (onSlotSelect) {
      onSlotSelect(selectedSlot === index ? null : index);
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-center">My Team</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Team Stats */}
      <div className="bg-blue-50 p-3 rounded mb-4">
        <div className="text-sm space-y-1">
          <div><span className="font-medium">Slots:</span> {stats.filledSlots}/6</div>
          <div><span className="font-medium">Types:</span> {stats.totalTypes}/18</div>
          <div><span className="font-medium">Coverage:</span> {stats.typeCoverage}%</div>
        </div>
        <button
          onClick={clearTeam}
          className="w-full mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
        >
          Clear Team
        </button>
      </div>

      {/* Team Slots */}
      <div className="space-y-2 mb-4">
        {team.pokemon.map((pokemon, index) => (
          <div
            key={index}
            className={`border-2 rounded p-2 ${onSlotSelect ? 'cursor-pointer' : ''} transition-colors ${
              selectedSlot === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleSlotClick(index)}
          >
            {pokemon ? (
              <div className="flex items-center space-x-2">
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="w-12 h-12"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pokemon.types.map((type, typeIndex) => (
                      <span
                        key={typeIndex}
                        className={`px-1 py-0.5 rounded text-xs text-white ${getTypeColor(type.name)}`}
                      >
                        {type.name}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePokemonFromTeam(index);
                  }}
                  className="bg-red-500 text-white px-1 py-0.5 rounded text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-gray-400 text-center pb-4">
                <div className="text-2xl mb-1">+</div>
                <div className="text-xs">Slot {index + 1}</div>
                {onSlotSelect && <div className="text-xs">Click to select</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Type Coverage */}
      <div>
        <h3 className="font-semibold mb-2 text-sm">Type Coverage</h3>
        <div className="flex flex-wrap gap-1">
          {team.coveredTypes.map((type) => (
            <span
              key={type}
              className={`px-2 py-1 rounded text-xs text-white font-medium ${getTypeColor(type)}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>
        {team.coveredTypes.length === 0 && (
          <p className="text-gray-500 text-sm">No types covered</p>
        )}
      </div>
    </div>
  );
};

export default PokemonTeamBuilder;