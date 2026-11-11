# Proyecto práctico S08: exposición de servicios y configuración segura

Despliegue local en Minikube de una arquitectura de dos capas: una API en Node.js y MongoDB. La configuración no sensible se entrega mediante un ConfigMap, las credenciales mediante un Secret y la API se expone con NodePort.

## Arquitectura

- `backend-service` expone la API como `NodePort` en el puerto `30080`.
- `mongo-service` expone MongoDB solo dentro del clúster como `ClusterIP` en el puerto `27017`.
- El backend recibe `DB_HOST`, `DB_NAME` y `APP_PORT` desde `app-config`.
- El backend y MongoDB reciben `DB_USER` y `DB_PASS` desde `db-secret`.

## Estructura

- `k8s/00-namespace.yaml`
- `k8s/01-app-configmap.yaml`
- `k8s/02-db-secret.yaml`
- `k8s/03-mongo-stack.yaml`
- `k8s/04-backend-stack.yaml`
- `src/Dockerfile`
- `src/package.json`
- `src/server.js`

## Requisitos

Minikube, kubectl y Docker disponible para Minikube.

## Despliegue

Desde la raíz del repositorio, construir la imagen dentro de Minikube:

`minikube image build -t practica-s08-backend:1.0 ./src`

Aplicar los manifiestos en este orden:

1. `kubectl apply -f k8s/00-namespace.yaml`
2. `kubectl apply -f k8s/01-app-configmap.yaml`
3. `kubectl apply -f k8s/02-db-secret.yaml`
4. `kubectl apply -f k8s/03-mongo-stack.yaml`
5. `kubectl apply -f k8s/04-backend-stack.yaml`

Esperar los despliegues:

- `kubectl rollout status deployment/mongo-deployment -n practica-s08`
- `kubectl rollout status deployment/backend-deployment -n practica-s08`

Revisar los recursos:

`kubectl get pods,svc,configmaps,secrets -n practica-s08`

## Validaciones

Para comprobar la inyección de variables:

1. Obtener el Pod: `BACKEND_POD=$(kubectl get pods -n practica-s08 -l app=backend -o jsonpath='{.items[0].metadata.name}')`
2. Revisar sus variables: `kubectl exec -it "$BACKEND_POD" -n practica-s08 -- env`

Para obtener la URL de acceso, ejecutar `minikube service backend-service -n practica-s08 --url` y abrir en el navegador la dirección que devuelve. En el driver Docker de Linux, mantener abierta la terminal mientras se usa la URL.

## Rutas de la API

- `GET /healthz`: confirma que el proceso del backend responde.
- `GET /`: verifica la conexión con MongoDB y devuelve el estado en JSON.

## Nota sobre las credenciales

El manifiesto `02-db-secret.yaml` contiene credenciales ficticias de laboratorio codificadas en Base64, tal como solicita la guía. Base64 es reversible y no cifra los datos. No usar estas credenciales fuera de la práctica ni incluir contraseñas reales en un repositorio público.
