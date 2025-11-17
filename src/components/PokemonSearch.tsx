import { useState, useEffect } from 'react';
import { usePokemonAPI } from '../data/usePokemonAPI';
import type { Pokemon } from '../data/usePokemonAPI';
import PokemonTeamBuilder from './PokemonTeamBuilder';

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const PokemonSearch = () => {
  const { POKEAPI_BASE_URL, fetchPokemon, addPokemonToTeam, team, removePokemonFromTeam, clearTeam, getTeamStats, getTypeColor, error } = usePokemonAPI();
  const [allPokemon, setAllPokemon] = useState<string[]>([]);
  const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    fetch(POKEAPI_BASE_URL+'/pokemon?limit=1000')
      .then(res => res.json())
      .then(data => setAllPokemon(data.results.map((p: any) => p.name)));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setDisplayedPokemon([]);
      const filtered = searchQuery
        ? allPokemon.filter(name => name.includes(searchQuery.toLowerCase()))
        : allPokemon;
      const details = await Promise.all(filtered.map(name => fetchPokemon(name)));
      let filteredPokemon = details.filter(Boolean) as Pokemon[];
      
      // Filter by selected types
      if (selectedTypes.length > 0) {
        filteredPokemon = filteredPokemon.filter(pokemon =>
          pokemon.types.some(type => selectedTypes.includes(type.name))
        );
      }
      
      setDisplayedPokemon(filteredPokemon);
      setLoading(false);
    };
    if (allPokemon.length) load();
  }, [allPokemon, searchQuery, selectedTypes, fetchPokemon]);

  const handleAddToTeam = async (pokemon: Pokemon) => {
    if (selectedSlot === null) {
      alert('Please select a team slot first!');
      return;
    }
    await addPokemonToTeam(pokemon.name, selectedSlot);
    setSelectedSlot(null);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSearchQuery('');
  };

  

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="sticky top-0 h-screen w-80 bg-white shadow-lg">
        <PokemonTeamBuilder 
          onSlotSelect={setSelectedSlot} 
          selectedSlot={selectedSlot}
          team={team}
          error={error}
          removePokemonFromTeam={removePokemonFromTeam}
          clearTeam={clearTeam}
          getTeamStats={getTeamStats}
        />
      </div>
      <div className="flex-1">
        <div className='sticky top-0 bg-white p-4 rounded shadow'>
          <div className='flex justify-center items-center gap-x-2'>
            <h1 className="text-3xl font-bold text-center">Pokemon Search: </h1>
            <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className=" p-2 border rounded w-full max-w-md block"
          />
          </div>
          {selectedSlot !== null && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded text-center">
              Slot {selectedSlot + 1} selected - Click a Pokemon to add it to your team
            </div>
          )}
          
          {/* Type Filters */}
          <div className="flex justify-center">
            <div className="w-fit">
              <div className="flex justify-center gap-2 items-center">
                <h3 className="font-semibold mb-2">Filter by Type</h3>
                {(selectedTypes.length > 0 || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm bg-gray-500 text-white px-3 rounded hover:bg-gray-600"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {POKEMON_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1 rounded text-white text-sm font-medium transition ${
                      getTypeColor(type)
                    } ${
                      selectedTypes.includes(type) 
                        ? 'ring-2 ring-offset-2 ring-blue-500' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          {loading && <div className="text-center mb-4">Loading...</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 p-4 gap-4">
            {displayedPokemon.map(pokemon => (
              <div
                key={pokemon.id}
                className={`bg-white rounded shadow p-2 cursor-pointer hover:bg-blue-50 transition ${
                  selectedSlot !== null ? 'ring-2 ring-blue-300' : ''
                }`}
                onClick={() => handleAddToTeam(pokemon)}
              >
                <img src={pokemon.sprite} alt={pokemon.name} loading="lazy"className="mx-auto mb-2 w-16 h-16" />
                <div className="text-center font-semibold">{pokemon.name}</div>
                <div className="flex flex-wrap gap-1 justify-center mt-1">
                  {pokemon.types.map((type, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded text-xs text-white ${getTypeColor(type.name)}`}
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonSearch;