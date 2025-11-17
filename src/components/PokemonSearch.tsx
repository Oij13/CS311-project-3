import { useState, useEffect } from 'react';
import { usePokemonAPI } from '../data/usePokemonAPI';
import type { Pokemon } from '../data/usePokemonAPI';
import PokemonTeamBuilder from './PokemonTeamBuilder';

interface PokemonListItem {
  name: string;
  url: string;
}

const PokemonSearch = () => {
  const { fetchPokemon, addPokemonToTeam } = usePokemonAPI();
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const POKEMON_PER_PAGE = 20;

  // Fetch all Pokemon names on component mount
  useEffect(() => {
    const fetchAllPokemon = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        setAllPokemon(data.results);
      } catch (error) {
        console.error('Failed to fetch Pokemon list:', error);
      }
    };

    fetchAllPokemon();
  }, []);

  // Filter and paginate Pokemon based on search
  useEffect(() => {
    const loadPokemon = async () => {
      setLoading(true);
      
      const filteredPokemon = searchQuery
        ? allPokemon.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allPokemon;

      const startIndex = currentPage * POKEMON_PER_PAGE;
      const endIndex = startIndex + POKEMON_PER_PAGE;
      const pokemonToLoad = filteredPokemon.slice(startIndex, endIndex);

      const pokemonDetails = await Promise.all(
        pokemonToLoad.map(async (p) => {
          return await fetchPokemon(p.name);
        })
      );

      setDisplayedPokemon(pokemonDetails.filter(p => p !== null) as Pokemon[]);
      setLoading(false);
    };

    if (allPokemon.length > 0) {
      loadPokemon();
    }
  }, [allPokemon, searchQuery, currentPage, fetchPokemon]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(0);
  };

  const handleAddToTeam = async (pokemon: Pokemon) => {
    if (selectedSlot !== null) {
      await addPokemonToTeam(pokemon.name, selectedSlot);
      setSelectedSlot(null);
    }
  };

  const getTypeColor = (type: string): string => {
    const typeColors: { [key: string]: string } = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-300',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300',
    };
    return typeColors[type] || 'bg-gray-400';
  };

  const filteredCount = searchQuery
    ? allPokemon.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).length
    : allPokemon.length;

  const totalPages = Math.ceil(filteredCount / POKEMON_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-gray-500">
      {/* Main Pokemon Search Area */}
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">Pokemon Database</h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full max-w-md mx-auto block p-3 border rounded-lg text-lg"
          />
        </div>

        {selectedSlot !== null && (
          <div className="mb-4 text-center bg-blue-100 p-2 rounded">
            Select a Pokemon to add to Team Slot {selectedSlot + 1}
            <button 
              onClick={() => setSelectedSlot(null)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Pokemon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          {displayedPokemon.map((pokemon) => (
            <div
              key={pokemon.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => selectedSlot !== null ? handleAddToTeam(pokemon) : null}
            >
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="w-24 h-24 mx-auto mb-2"
              />
              <h3 className="text-center font-semibold text-lg mb-2">
                #{pokemon.id.toString().padStart(3, '0')} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </h3>
              <div className="flex flex-wrap gap-1 justify-center">
                {pokemon.types.map((type, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs text-white font-medium ${getTypeColor(type.name)}`}
                  >
                    {type.name}
                  </span>
                ))}
              </div>
              {selectedSlot !== null && (
                <div className="mt-2 text-center text-sm text-blue-600 font-medium">
                  Click to add to team
                </div>
              )}
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading Pokemon...</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-lg">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      {/* Team Builder Sidebar */}
      <div className="w-80 bg-white shadow-lg">
        <PokemonTeamBuilder onSlotSelect={setSelectedSlot} selectedSlot={selectedSlot} />
      </div>
    </div>
  );
};

export default PokemonSearch;