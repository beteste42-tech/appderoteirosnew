import React, { useEffect, useRef, useState } from 'react';
import { Cliente } from '../context/AppContext';

// Tipos do Google Maps serão carregados via @types/google.maps

interface RouteMapProps {
  clientesSelecionados: (string | null)[];
  todosClientes: Cliente[];
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyAYPqweXiFwIA_PP1y1tbmjZiEXgSdqIUE';

// Coordenadas do BIG LOG CENTRO LOGISTICO, CIA SUL como ponto de partida e chegada fixo
const PONTO_PARTIDA = {
  lat: -12.82461131508215,
  lng: -38.4028915407333,
  nome: "BIG LOG CENTRO LOGISTICO, CIA SUL",
  endereco: "V ACESSO II BR324, 1796 GALPAO 04A",
  cidade: "Simões Filho - BA",
  cep: "43700-000"
};

const RouteMap: React.FC<RouteMapProps> = ({ clientesSelecionados, todosClientes }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar script do Google Maps
  useEffect(() => {
    if ((window as any).google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,directions`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup se necessário
    };
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !(window as any).google?.maps) return;

    if (!mapInstanceRef.current) {
      const google = (window as any).google;
      const map = new google.maps.Map(mapRef.current, {
        center: PONTO_PARTIDA, // Centro do mapa agora é o ponto de partida/chegada
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#003e2a',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });
      
      // Adicionar marcador para o ponto de partida/chegada
      const markerPartida = new google.maps.Marker({
        position: PONTO_PARTIDA,
        map,
        label: {
          text: "P/C",
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        title: `${PONTO_PARTIDA.nome} - Ponto de Partida e Chegada`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ff0000',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindowPartida = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="color: #ff0000; margin: 0 0 5px 0;">PONTO DE PARTIDA / CHEGADA</h3>
            <p style="margin: 0; font-weight: bold;">${PONTO_PARTIDA.nome}</p>
            <p style="margin: 0;">${PONTO_PARTIDA.endereco}</p>
            <p style="margin: 0;">${PONTO_PARTIDA.cidade}</p>
            <p style="margin: 0;">CEP: ${PONTO_PARTIDA.cep}</p>
          </div>
        `,
      });

      markerPartida.addListener('click', () => {
        infoWindowPartida.open(map, markerPartida);
      });
    }
  }, [isLoaded]);

  // Atualizar mapa quando clientes mudarem
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !(window as any).google?.maps) return;

    // Limpar marcadores anteriores
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Limpar polylines anteriores
    polylinesRef.current.forEach(polyline => polyline.setMap(null));
    polylinesRef.current = [];

    // Filtrar clientes selecionados com coordenadas válidas
    const clientesComCoordenadas = clientesSelecionados
      .map((nomeCliente, index) => {
        if (!nomeCliente) return null;
        const cliente = todosClientes.find(c => c.nome === nomeCliente);
        if (!cliente || !cliente.latitude || !cliente.longitude) return null;
        
        const lat = typeof cliente.latitude === 'number' ? cliente.latitude : parseFloat(String(cliente.latitude));
        const lng = typeof cliente.longitude === 'number' ? cliente.longitude : parseFloat(String(cliente.longitude));
        
        if (isNaN(lat) || isNaN(lng)) return null;
        
        return {
          nome: cliente.nome,
          lat,
          lng,
          ordem: index + 1,
        };
      })
      .filter((c): c is { nome: string; lat: number; lng: number; ordem: number } => c !== null);

    if (clientesComCoordenadas.length === 0) {
      // Limpar rota anterior se não houver clientes
      if (directionsRendererRef.current && mapInstanceRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = new (window as any).google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#003e2a',
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        });
      }
      setDistanciaTotal(0);
      return;
    }

    // Criar marcadores para os clientes
    const google = (window as any).google;
    clientesComCoordenadas.forEach((cliente) => {
      const marker = new google.maps.Marker({
        position: { lat: cliente.lat, lng: cliente.lng },
        map: mapInstanceRef.current,
        label: {
          text: String(cliente.ordem),
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        title: `${cliente.ordem}ª Entrega - ${cliente.nome}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#003e2a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // InfoWindow para cada marcador
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="color: #003e2a; margin: 0 0 5px 0;">${cliente.ordem}ª Entrega</h3>
            <p style="margin: 0;">${cliente.nome}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Calcular rota e distância
    if (clientesComCoordenadas.length > 0 && directionsServiceRef.current && directionsRendererRef.current) {
      const google = (window as any).google;
      
      // Estratégia: calcular rota até o último cliente e depois adicionar linha de volta
      const ultimoCliente = clientesComCoordenadas[clientesComCoordenadas.length - 1];
      const clientesWaypoints = clientesComCoordenadas.slice(0, -1).map(c => ({
        location: { lat: c.lat, lng: c.lng },
        stopover: true,
      }));

      // Primeira parte: ponto de partida -> todos os clientes (último como destino)
      const request: any = {
        origin: PONTO_PARTIDA,
        destination: { lat: ultimoCliente.lat, lng: ultimoCliente.lng },
        waypoints: clientesWaypoints.length > 0 ? clientesWaypoints : undefined,
        optimizeWaypoints: false, // Manter a ordem selecionada
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsServiceRef.current.route(request, (result: any, status: any) => {
        if (status === google.maps.DirectionsStatus.OK && result && directionsRendererRef.current) {
          // Calcular distância da primeira parte
          let totalDistance = 0;
          result.routes[0]?.legs.forEach((leg: any) => {
            if (leg.distance) {
              totalDistance += leg.distance.value; // valor em metros
            }
          });

          // Calcular o trecho de volta do último cliente para o ponto de finalização
          const requestVolta: any = {
            origin: { lat: ultimoCliente.lat, lng: ultimoCliente.lng },
            destination: PONTO_PARTIDA,
            travelMode: google.maps.TravelMode.DRIVING,
          };

          directionsServiceRef.current!.route(requestVolta, (resultVolta: any, statusVolta: any) => {
            if (statusVolta === google.maps.DirectionsStatus.OK && resultVolta) {
              // Adicionar distância do trecho de volta
              resultVolta.routes[0]?.legs.forEach((leg: any) => {
                if (leg.distance) {
                  totalDistance += leg.distance.value;
                }
              });

              // Desenhar a rota principal (até o último cliente)
              directionsRendererRef.current!.setDirections(result);

              // Adicionar linha de volta manualmente usando Polyline
              const voltaPath = resultVolta.routes[0].overview_path || 
                resultVolta.routes[0].legs[0].steps.map((step: any) => step.path).flat();
              
              const polylineVolta = new google.maps.Polyline({
                path: voltaPath,
                geodesic: true,
                strokeColor: '#003e2a',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map: mapInstanceRef.current,
              });
              
              polylinesRef.current.push(polylineVolta);

              setDistanciaTotal(totalDistance / 1000); // converter para km
            } else {
              // Se falhar o cálculo de volta, usar geometria
              if (google.maps?.geometry?.spherical) {
                const fromLast = new google.maps.LatLng(ultimoCliente.lat, ultimoCliente.lng);
                const toFinal = new google.maps.LatLng(PONTO_PARTIDA.lat, PONTO_PARTIDA.lng);
                const distanceVolta = google.maps.geometry.spherical.computeDistanceBetween(fromLast, toFinal);
                totalDistance += distanceVolta;
                
                // Desenhar linha de volta usando geometria
                const polylineVolta = new google.maps.Polyline({
                  path: [fromLast, toFinal],
                  geodesic: true,
                  strokeColor: '#003e2a',
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  map: mapInstanceRef.current,
                });
                
                polylinesRef.current.push(polylineVolta);
                
                setDistanciaTotal(totalDistance / 1000);
              }
            }
          });
        } else {
          console.error('Erro ao calcular rota:', status);
          // Se falhar, calcular distância usando geometria
          if (google.maps?.geometry?.spherical) {
            let totalDistance = 0;
            
            // Adicionar distância do ponto de partida para o primeiro cliente
            const fromPartida = new google.maps.LatLng(PONTO_PARTIDA.lat, PONTO_PARTIDA.lng);
            const toFirst = new google.maps.LatLng(clientesComCoordenadas[0].lat, clientesComCoordenadas[0].lng);
            const distancePartida = google.maps.geometry.spherical.computeDistanceBetween(fromPartida, toFirst);
            totalDistance += distancePartida;
            
            // Calcular distâncias entre os clientes
            for (let i = 0; i < clientesComCoordenadas.length - 1; i++) {
              const from = new google.maps.LatLng(clientesComCoordenadas[i].lat, clientesComCoordenadas[i].lng);
              const to = new google.maps.LatLng(clientesComCoordenadas[i + 1].lat, clientesComCoordenadas[i + 1].lng);
              const distance = google.maps.geometry.spherical.computeDistanceBetween(from, to);
              totalDistance += distance;
            }
            
            // Adicionar distância do último cliente de volta para o ponto de finalização
            const fromLast = new google.maps.LatLng(
              clientesComCoordenadas[clientesComCoordenadas.length - 1].lat,
              clientesComCoordenadas[clientesComCoordenadas.length - 1].lng
            );
            const distanceVolta = google.maps.geometry.spherical.computeDistanceBetween(fromLast, fromPartida);
            totalDistance += distanceVolta;
            
            setDistanciaTotal(totalDistance / 1000); // converter para km
          }
        }
      });
    }
  }, [isLoaded, clientesSelecionados, todosClientes]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-3 p-2 lg:p-3 bg-gray-100 dark:bg-slate-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-3 h-3 lg:w-4 lg:h-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></div>
          <span className="text-xs sm:text-sm truncate">Ponto de Partida/Chegada: {PONTO_PARTIDA.nome}</span>
        </div>
        {distanciaTotal > 0 && (
          <div className="text-xs sm:text-sm font-medium whitespace-nowrap">
            Distância Total: {distanciaTotal.toFixed(2)} km
          </div>
        )}
      </div>
      
      <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Informação:</span> A rota começa e termina no BIG LOG CENTRO LOGISTICO, 
          passando por todos os clientes na ordem selecionada.
        </p>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full rounded-lg flex-1"
        style={{ height: '600px', minHeight: '400px', width: '100%', borderRadius: '0.5rem' }}
      />
    </div>
  );
};

export default RouteMap;
