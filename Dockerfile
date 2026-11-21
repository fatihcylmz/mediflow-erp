# Root Dockerfile for MediFlow Healthcare ERP
# Multi-stage build for both backend and frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend
COPY mediflow-frontend/package*.json ./
RUN npm ci --only=production

FROM mcr.microsoft.com/dotnet/sdk:10.0 as backend-builder

WORKDIR /app/backend
COPY src/ .
RUN dotnet restore
RUN dotnet build --configuration Release --no-restore
RUN dotnet publish --configuration Release --no-build -o /app/backend/out

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app
COPY --from=backend-builder /app/backend/out ./backend
COPY --from=frontend-builder /app/frontend ./frontend

EXPOSE 80

CMD ["dotnet", "backend/MediFlow.HttpApi.Host.dll"]