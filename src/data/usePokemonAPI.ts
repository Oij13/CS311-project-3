import { useState, useCallback } from 'react';

export interface PokemonType {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  sprite: string;
}

export interface Team {
  pokemon: (Pokemon | null)[];
  coveredTypes: string[];
}

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export const usePokemonAPI = () => {
  const [team, setTeam] = useState<Team>({
    pokemon: Array(6).fill(null),
    coveredTypes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a single Pokemon by name or ID
  const fetchPokemon = useCallback(async (nameOrId: string | number): Promise<Pokemon | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${nameOrId.toString().toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error('Pokemon not found');
      }
      
      const data = await response.json();
      
      const pokemon: Pokemon = {
        id: data.id,
        name: data.name,
        types: data.types.map((type: any) => ({
          name: type.type.name,
          url: type.type.url
        })),
        sprite: data.sprites.front_default || data.sprites.other['official-artwork'].front_default
      };
      
      return pokemon;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add Pokemon to team at specific position
  const addPokemonToTeam = useCallback(async (nameOrId: string | number, position: number) => {
    if (position < 0 || position >= 6) {
      setError('Invalid team position');
      return;
    }

    const pokemon = await fetchPokemon(nameOrId);
    if (pokemon) {
      setTeam(prevTeam => {
        const newPokemon = [...prevTeam.pokemon];
        newPokemon[position] = pokemon;
        
        const coveredTypes = getCoveredTypes(newPokemon);
        
        return {
          pokemon: newPokemon,
          coveredTypes
        };
      });
    }
  }, [fetchPokemon]);

  // Remove Pokemon from team at specific position
  const removePokemonFromTeam = useCallback((position: number) => {
    if (position < 0 || position >= 6) {
      setError('Invalid team position');
      return;
    }

    setTeam(prevTeam => {
      const newPokemon = [...prevTeam.pokemon];
      newPokemon[position] = null;
      
      const coveredTypes = getCoveredTypes(newPokemon);
      
      return {
        pokemon: newPokemon,
        coveredTypes
      };
    });
  }, []);

  // Clear entire team
  const clearTeam = useCallback(() => {
    setTeam({
      pokemon: Array(6).fill(null),
      coveredTypes: []
    });
  }, []);

  // Get all types covered by the current team
  const getCoveredTypes = useCallback((pokemon: (Pokemon | null)[]): string[] => {
    const types = new Set<string>();
    
    pokemon.forEach(p => {
      if (p) {
        p.types.forEach(type => {
          types.add(type.name);
        });
      }
    });
    
    return Array.from(types).sort();
  }, []);

  // Get team statistics
  const getTeamStats = useCallback(() => {
    const filledSlots = team.pokemon.filter(p => p !== null).length;
    const totalTypes = 18; // Total number of Pokemon types
    const typeCoverage = (team.coveredTypes.length / totalTypes) * 100;
    
    return {
      filledSlots,
      emptySlots: 6 - filledSlots,
      totalTypes: team.coveredTypes.length,
      typeCoverage: Math.round(typeCoverage)
    };
  }, [team]);

  // Search for Pokemon (returns basic info for autocomplete/search)
  const searchPokemon = useCallback(async (query: string, limit: number = 10) => {
    try {
      setLoading(true);
      
      // Get list of all Pokemon (you might want to cache this)
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1000`);
      const data = await response.json();
      
      const filtered = data.results
        .filter((pokemon: any) => 
          pokemon.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit);
      
      return filtered;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search Pokemon');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    team,
    loading,
    error,
    addPokemonToTeam,
    removePokemonFromTeam,
    clearTeam,
    getTeamStats,
    searchPokemon,
    fetchPokemon
  };
};