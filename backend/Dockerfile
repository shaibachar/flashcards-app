FROM mcr.microsoft.com/dotnet/aspnet:9.0-preview AS base
WORKDIR /app
# The ASP.NET base image listens on port 8080 by default via ASPNETCORE_URLS.
# Override it to ensure the API runs on port 80 as expected by docker-compose.
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0-preview AS build
WORKDIR /src
COPY . .
RUN dotnet restore ./FlashcardsApi/FlashcardsApi.csproj
RUN dotnet publish ./FlashcardsApi/FlashcardsApi.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FlashcardsApi.dll"]

