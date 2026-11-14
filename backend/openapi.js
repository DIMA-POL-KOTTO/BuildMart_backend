const openapi = {
    openapi: "3.0.0",
    info: {
        title: "BuildMart API",
        version: "1.0.0"
    },
    servers: [
        {
            url: "/",
            description: "Current server"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    },
    paths: {}
};

export default openapi;