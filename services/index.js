// Add this code to service/index.js to allow your code to select a port to run on based on the command line parameters
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Add this code to service/index.js to cause Express static middleware to serve files from the public directory once your
// code has been deployed to your AWS server
app.use(express.static("public"));

/* 
Add a vite.config.js file to your main startup directory (right above the service and src directories) with the following 
content (or copy it over from Simon). This will forward fetch requests that go to a path like "fetch('/api/scores')" to 
connect to your backend server running on port 4000
*/
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
