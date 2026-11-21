# Backend Dockerfile for MediFlow Healthcare ERP
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app
COPY . .
RUN dotnet publish -c Release -o out

EXPOSE 80

CMD ["dotnet", "out/MediFlow.HttpApi.Host.dll"]