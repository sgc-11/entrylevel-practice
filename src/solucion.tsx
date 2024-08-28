import React, { useState, useEffect } from "react";

interface Player {
  first_name: string;
  h_in: string;
  last_name: string;
}

export const Prueba: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [targetHeight, setTargetHeight] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [mapResults, setMapResults] = useState<string[]>([]);
  const [loopTime, setLoopTime] = useState<number | null>(null);
  const [mapTime, setMapTime] = useState<number | null>(null);

  const getPlayers = async () => {
    try {
      const response = await fetch('https://mach-eight.uc.r.appspot.com/');
      const api = await response.json();
      setPlayers(api.values);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  useEffect(() => {
    getPlayers();
  }, []);

  const findPlayerPairs = () => {
    const startTime = performance.now();
    const pairs: string[] = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const height1 = parseInt(players[i].h_in, 10);
        const height2 = parseInt(players[j].h_in, 10);
        if (height1 + height2 === targetHeight) {
          pairs.push(`${players[i].first_name} ${players[i].last_name} y ${players[j].first_name} ${players[j].last_name}`);
        }
      }
    }
    const endTime = performance.now();
    setLoopTime(endTime - startTime);
    setResults(pairs);
  };

  const findPlayerPairsUsingMap = () => {
    const startTime = performance.now();
    const heightMap = new Map<number, Player[]>();
    const pairs: string[] = [];

    players.forEach(player => {
      const height = parseInt(player.h_in, 10);
      const complement = targetHeight - height;

      if (heightMap.has(complement)) {
        heightMap.get(complement)!.forEach(complementPlayer => {
          pairs.push(`${player.first_name} ${player.last_name} y ${complementPlayer.first_name} ${complementPlayer.last_name}`);
        });
      }

      if (heightMap.has(height)) {
        heightMap.get(height)!.push(player);
      } else {
        heightMap.set(height, [player]);
      }
    });

    const endTime = performance.now();
    setMapTime(endTime - startTime);
    setMapResults(pairs);
  };

  const handleSearch = () => {
    findPlayerPairs();
  };

  const handleMapSearch = () => {
    findPlayerPairsUsingMap();
  };

  return (
    <div className="div-total">
      <div className="div-izquierda">
        <div className="div-1">
          <h2>Búsqueda de jugadores por altura combinada</h2>
          <input
            type="number"
            onChange={(e) => setTargetHeight(Number(e.target.value))}
            placeholder="Ingrese la altura objetivo en pulgadas"
          />
          <button onClick={handleSearch}>Buscar con ciclos</button>
          <button onClick={handleMapSearch}>Buscar con map</button>
        </div>

        <div className="div-jugadores">
          <h3>Lista de jugadores:</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index}>
                {player.first_name} {player.last_name} - Altura: {player.h_in} pulgadas
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="div-resultados">
        <h3>Resultados ( con ciclos ):</h3>
        {loopTime !== null && (
          <p>Tiempo de ejecución: {loopTime.toFixed(2)} ms</p>
        )}
        {results.length > 0 ? (
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        ) : (
          <p>No se encontraron coincidencias.</p>
        )}
      </div>

      <div className="div-resultados">
        <h3>Resultados ( con .map ):</h3>
        {mapTime !== null && (
          <p>Tiempo de ejecución: {mapTime.toFixed(2)} ms</p>
        )}
        {mapResults.length > 0 ? (
          <ul>
            {mapResults.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        ) : (
          <p>No se encontraron coincidencias.</p>
        )}
      </div>
    </div>
  );
};