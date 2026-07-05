export const swaggerSpec = {
  openapi: "3.0.0",
  info: { title: "Layers API", version: "1.0.0" },
  servers: [{ url: "http://localhost:4000" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Регистрация нового пользователя",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  name: { type: "string" },
                },
                required: ["email", "password", "name"],
              },
            },
          },
        },
        responses: { "201": { description: "Пользователь создан" }, "409": { description: "Email занят" } },
      },
    },
    "/auth/login": {
      post: {
        summary: "Вход",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { email: { type: "string" }, password: { type: "string" } },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: { "200": { description: "Токен выдан" }, "401": { description: "Неверные данные" } },
      },
    },
    "/auth/me": {
      get: {
        summary: "Текущий пользователь",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Данные пользователя" }, "401": { description: "Не авторизован" } },
      },
    },
  },
};