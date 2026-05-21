FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

COPY backend/.mvn .mvn
COPY backend/mvnw .
COPY backend/pom.xml .

RUN ./mvnw dependency:go-offline

COPY backend/src src

RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]