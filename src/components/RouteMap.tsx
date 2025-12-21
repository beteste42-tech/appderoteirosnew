import React, { useEffect, useRef, useState } from 'react';
import { Cliente } from '../context/AppContext';

// Tipos do Google Maps serão carregados via @types/google.maps

interface RouteMapProps {
  clientesSelecionados: (string | null)[];
  todosClientes: Cliente[];
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyAYPqweXiFwIA_PP1y1tbmjZiEXgSdqIUE';

const RouteMap: React.FC<RouteMapProps> = ({ clientesSelecionados, todosClientes }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar script do Google Maps
  useEffect(() => {
    if (window.google?.maps) {
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
    if (!isLoaded || !mapRef.current || !window.google?.maps) return;

    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: -12.9714, lng: -38.5014 }, // Salvador como centro padrão
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
    }
  }, [isLoaded]);

  // Atualizar mapa quando clientes mudarem
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;
    if (!window.google?.maps) return;

    // Limpar marcadores anteriores
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

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
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
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

    // Criar marcadores
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
            <strong style="color: #003e2a;">${cliente.ordem}ª Entrega</strong><br>
            <span>${cliente.nome}</span>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Calcular rota e distância
    if (clientesComCoordenadas.length > 1 && directionsServiceRef.current && directionsRendererRef.current) {
      const waypoints = clientesComCoordenadas.slice(1, -1).map(c => ({
        location: { lat: c.lat, lng: c.lng },
        stopover: true,
      }));

      const request: google.maps.DirectionsRequest = {
        origin: { lat: clientesComCoordenadas[0].lat, lng: clientesComCoordenadas[0].lng },
        destination: {
          lat: clientesComCoordenadas[clientesComCoordenadas.length - 1].lat,
          lng: clientesComCoordenadas[clientesComCoordenadas.length - 1].lng,
        },
        waypoints: waypoints.length > 0 ? waypoints : undefined,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsServiceRef.current.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        if (status === google.maps.DirectionsStatus.OK && result && directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);
          
          // Calcular distância total
          let totalDistance = 0;
          result.routes[0]?.legs.forEach((leg: google.maps.DirectionsLeg) => {
            if (leg.distance) {
              totalDistance += leg.distance.value; // valor em metros
            }
          });
          setDistanciaTotal(totalDistance / 1000); // converter para km
        } else {
          console.error('Erro ao calcular rota:', status);
          // Se falhar, calcular distância usando geometria
          if (window.google?.maps?.geometry?.spherical) {
            let totalDistance = 0;
            for (let i = 0; i < clientesComCoordenadas.length - 1; i++) {
              const from = new google.maps.LatLng(clientesComCoordenadas[i].lat, clientesComCoordenadas[i].lng);
              const to = new google.maps.LatLng(clientesComCoordenadas[i + 1].lat, clientesComCoordenadas[i + 1].lng);
              const distance = google.maps.geometry.spherical.computeDistanceBetween(from, to);
              totalDistance += distance;
            }
            setDistanciaTotal(totalDistance / 1000);
          }
        }
      });
    } else if (clientesComCoordenadas.length === 1) {
      // Apenas um cliente - centralizar no mapa
      mapInstanceRef.current.setCenter({ lat: clientesComCoordenadas[0].lat, lng: clientesComCoordenadas[0].lng });
      mapInstanceRef.current.setZoom(15);
      setDistanciaTotal(0);
    }

    // Ajustar zoom para mostrar todos os pontos
    if (clientesComCoordenadas.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      clientesComCoordenadas.forEach(c => {
        bounds.extend({ lat: c.lat, lng: c.lng });
      });
      mapInstanceRef.current?.fitBounds(bounds);
    }
  }, [clientesSelecionados, todosClientes, isLoaded]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-[400px] rounded-lg" />
      {distanciaTotal > 0 && (
        <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Distância Total</div>
          <div className="text-lg font-bold text-primary dark:text-green-400">
            {distanciaTotal.toFixed(2)} km
          </div>
        </div>
      )}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
          <div className="text-gray-500 dark:text-gray-400">Carregando mapa...</div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;

