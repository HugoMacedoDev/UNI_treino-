const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

require("dotenv").config();
const { verifyJWT } = require("./middleware/middleware.jwtoken");
const accountRoutes = require("./routes/route.account");
const chatRoutes = require("./routes/route.chat");
const { connectDB } = require("./config/database");
const { connectMailtap } = require("./models/model.mailer");
const treinoRoutes = require("./routes/route.treino");

const app = express();
const porta = process.env.NODE_API_PORT;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Node UniTreino",
      version: "1.0.0",
      description: "API para acessar banco do UniTreino",
    },
    servers: [
      {
        url: "http://localhost:" + porta,
        description: "Local development server",
      },
    ],
  },
  apis: [
    "./server/routes/route.*.js",
    "./server/routes/*/route.*.js",
    "./server/routes/*/*/route.*.js",
  ],
};

const swaggerDocument = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());
app.use(bodyParser.json());
app.use("/v1/account", accountRoutes);
app.use("/v1/mensagem", chatRoutes);
app.use("/v1/treinos", treinoRoutes);
// app.use("/v1/login", verifyJWT accountRoutes);

connectDB();

app.listen(porta, () => {
  console.log(`Server aberto na porta: ${porta}`);
});

// curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent" \
//   -H 'Content-Type: application/json' \
//   -H 'X-goog-api-key: AIzaSyAGiU7lo3mSu5_LVHZoXCXwrRT8KA_1vG8' \
//   -X POST \
//   -d '{
//     "contents": [
//       {
//         "parts": [
//           {
//             "text": "Explain how AI works in a few words"
//           }
//         ]
//       }
//     ]
//   }'
