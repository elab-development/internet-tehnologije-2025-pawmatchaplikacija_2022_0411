// src/app/api/openapi/route.ts
import { NextResponse } from "next/server";

/**
 * Next.js (App Router) API route that returns OpenAPI (Swagger) specification as JSON.
 * Swagger UI (na /api-docs) učitava ovaj JSON preko URL-a: /api/openapi
 */

// Osigurava da se ruta ne kešira (da uvek dobiješ sveže promene dok razvijaš)
export const dynamic = "force-dynamic";

export async function GET() {
  /**
   * OpenAPI spec (OAS 3.0).
   * - info: osnovne informacije o API-ju
   * - servers: base URL (lokalno)
   * - components/securitySchemes: definicija Bearer JWT autentifikacije (Authorize dugme)
   * - security: globalno pravilo da se endpointi smatraju zaštićenim Bearer tokenom
   * - paths: lista endpointa (rute) sa metodama (GET/POST...) i opisima
   */
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "PawMatch API",
      version: "1.0.0",
      description: "Official API documentation for PawMatch",
    },

    // Gde API “živi” (base URL). Lokalno je obično localhost:3000
    servers: [{ url: "http://localhost:3000" }],

    /**
     * components -> securitySchemes:
     * Definišemo Bearer JWT autentifikaciju da bi Swagger UI prikazao "Authorize" dugme.
     * Kada uneseš token, Swagger ga automatski šalje u header-u:
     * Authorization: Bearer <token>
     */
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    /**
     * security (globalno):
     * Ovo znači: “podrazumevano svi endpointi koriste bearerAuth”.
     * Ako neki endpoint treba da bude javan (npr. login/register),
     * možeš mu u okviru te rute staviti: security: []
     */
    security: [{ bearerAuth: [] }],

    /**
     * paths:
     * Ovde upisuješ sve svoje API rute koje želiš da budu vidljive u Swaggeru.
     * Minimalno za zahtev predmeta dovoljno je 3–5 ruta.
     */
    paths: {
      "/api/auth/login": {
        post: {
          summary: "Login user",
          description: "Logs in a user and returns auth/session (depending on implementation).",

          // Login je obično JAVAN endpoint → isključimo globalni bearerAuth za ovu rutu
          security: [],

          // (Opcionalno) requestBody šema - korisno da profesor vidi šta šaljete
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "test@mail.com" },
                    password: { type: "string", example: "Pass123!" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },

          responses: {
            "200": { description: "Successful login" },
            "401": { description: "Invalid credentials" },
          },
        },
      },

      "/api/auth/register": {
        post: {
          summary: "Register user",
          description: "Creates a new user account.",

          // Register je obično JAVAN endpoint → isključimo globalni bearerAuth
          security: [],

          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "new@mail.com" },
                    password: { type: "string", example: "Pass123!" },
                    // Ako imate još polja (username, name...), dodajte ih ovde
                  },
                  required: ["email", "password"],
                },
              },
            },
          },

          responses: {
            "200": { description: "User registered" },
            "400": { description: "Validation error" },
          },
        },
      },

      "/api/auth/me": {
        get: {
          summary: "Get current user",
          description: "Returns info about the currently authenticated user.",

          // Ova ruta je zaštićena (koristi global bearerAuth) – ovde ne stavljamo security:[]
          responses: {
            "200": { description: "Returns logged-in user" },
            "401": { description: "Unauthorized" },
          },
        },
      },

      "/api/pet": {
        post: {
          summary: "Create pet",
          description: "Creates a new pet for the authenticated user.",

          // Zaštićeno (Bearer token)
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Luna" },
                    breed: { type: "string", example: "Husky" },
                    age: { type: "number", example: 3 },
                  },
                  required: ["name"],
                },
              },
            },
          },

          responses: {
            "200": { description: "Pet created" },
            "401": { description: "Unauthorized" },
          },
        },
      },

      "/api/matches": {
        get: {
          summary: "Get matches",
          description: "Returns matches for the authenticated user.",

          // Zaštićeno (Bearer token)
          responses: {
            "200": { description: "List of matches" },
            "401": { description: "Unauthorized" },
          },
        },
      },
    },
  };

  // Vraćamo spec kao JSON
  return NextResponse.json(spec);
}