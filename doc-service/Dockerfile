
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# 1. Build + install the library modules into the local Maven repo.
COPY payment-service/pom.xml ./payment-service/pom.xml
COPY payment-service/src ./payment-service/src
RUN mvn -f payment-service/pom.xml -q -DskipTests install
COPY ai-service/pom.xml ./ai-service/pom.xml
COPY ai-service/src ./ai-service/src
RUN mvn -f ai-service/pom.xml -q -DskipTests install

# 2. Build doc-service (resolves the com.docservice:* libraries from the local repo).
COPY doc-service/pom.xml ./doc-service/pom.xml
RUN mvn -f doc-service/pom.xml dependency:go-offline -q
COPY doc-service/src ./doc-service/src
RUN mvn -f doc-service/pom.xml package -DskipTests -q

FROM eclipse-temurin:21-jre-jammy

# Trimmed TeX Live (~1 GB) — covers the common templates (article, beamer, CV,
# letters, reports, fonts, math). Swap in texlive-full for exotic packages.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        texlive-latex-base \
        texlive-latex-recommended \
        texlive-latex-extra \
        texlive-fonts-recommended \
        texlive-fonts-extra \
        texlive-science \
        texlive-xetex \
        latexmk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /build/doc-service/target/*.jar app.jar

ENV LATEX_COMPILER=native

EXPOSE 5001

ENTRYPOINT ["java", "-jar", "app.jar"]
