import java.util.*;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class mserver {

    // Store all client output streams
    public static List<PrintWriter> clientWriters = Collections.synchronizedList(new ArrayList<>());
    // Store all client ids
    public static List<Integer> clientIds = Collections.synchronizedList(new ArrayList<>());
    // Client id generator
    public static int clientIdCounter = 1;
    // Server socket, declared static to be accessible by shutdown hook
    private static ServerSocket ss2 = null;
    private static volatile boolean running = true;

    public static void main(String s[]) throws Exception {
        Socket sa = null;
        // ServerSocket ss2 = null; // Moved to static field
        System.out.println("Host starts accepting response ");

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            running = false; // Signal the main loop to stop
            System.out.println("Server shutting down...");
            try {
                if (ss2 != null && !ss2.isClosed()) {
                    ss2.close(); // Close the server socket to stop accepting new connections
                }
                // Gracefully close all client connections
                synchronized (mserver.clientWriters) {
                    for (PrintWriter writer : new ArrayList<>(mserver.clientWriters)) { // Iterate over a copy
                        try {
                            writer.println("SERVER_SHUTDOWN: Server is shutting down.");
                            writer.flush();
                            writer.close(); // This will eventually cause the ServerThread to terminate
                        } catch (Exception e) {
                            System.err.println("Error notifying client of shutdown: " + e.getMessage());
                        }
                    }
                    mserver.clientWriters.clear();
                    mserver.clientIds.clear();
                }
            } catch (IOException e) {
                System.err.println("Error closing server socket during shutdown: " + e.getMessage());
                e.printStackTrace();
            }
            System.out.println("Server shutdown complete.");
        }));

        try {
            ss2 = new ServerSocket(9998); // Changed port to 9998
        } catch (IOException e) {
            System.err.println("Error initializing server socket on port 9998: " + e.getMessage()); // Updated port in error message
            e.printStackTrace();
            System.exit(1); // Exit if server socket cannot be created
        }
        while (running) { // Loop while running is true
            try {
                sa = ss2.accept();
                if (!running) break; // Check again after accept, in case shutdown started during accept
                System.out.println("connection established by" + ss2.getInetAddress());
                ServerThread st = new ServerThread(sa);
                st.start();
            } catch (SocketException e) {
                if (!running || (ss2 != null && ss2.isClosed())) {
                    System.out.println("Server socket closed, exiting main loop.");
                    // This is expected if the server is shutting down
                } else {
                    System.err.println("SocketException in main loop (server still running?):" + e.getMessage());
                    e.printStackTrace();
                }
            } catch (Exception e) {
                if (running) { // Only log if we are supposed to be running
                    System.err.println("Connection error in main loop:");
                    e.printStackTrace();
                }
            }
        }
        System.out.println("Main server loop finished.");
    }
}

class ServerThread extends Thread {
    String line = null;
    BufferedReader is = null;
    PrintWriter od = null;
    Socket s1 = null;
    int clientId;

    public ServerThread(Socket s) {
        s1 = s;
        try {
            od = new PrintWriter(new OutputStreamWriter(s1.getOutputStream(), StandardCharsets.UTF_8), true);
            // Assign a unique id
            synchronized (mserver.class) {
                clientId = mserver.clientIdCounter++;
            }
            mserver.clientWriters.add(od);
            mserver.clientIds.add(clientId);
            // Notify this client its id (optional)
            od.println("Your client id is: " + clientId);
        } catch (IOException e) {
            System.out.println("output stream error");
        }
    }

    public void run() {
        try {
            is = new BufferedReader(new InputStreamReader(s1.getInputStream(), StandardCharsets.UTF_8));
            line = is.readLine();
            while (line != null && !line.equals("QUIT")) { // Check for null if stream closes
                // Forward the message to other clients with id
                synchronized(mserver.clientWriters) {
                    for (int i = 0; i < mserver.clientWriters.size(); i++) {
                        PrintWriter writer = mserver.clientWriters.get(i);
                        int id = mserver.clientIds.get(i);
                        if (writer != od) {
                            writer.println("Client " + clientId + ": " + line);
                        }
                    }
                }
                System.out.println("response to client " + clientId + ": " + line);
                line = is.readLine();
            }
            // Remove output stream and id when client exits
            synchronized(mserver.clientWriters) { // Ensure thread-safe removal
                int idx = mserver.clientWriters.indexOf(od);
                if (idx != -1) {
                    mserver.clientWriters.remove(idx);
                    mserver.clientIds.remove(idx);
                }
            }
            System.out.println("Client " + clientId + " disconnected.");
        } catch (SocketException se) {
            System.out.println("SocketException for client " + clientId + ": " + se.getMessage() + ". Connection likely closed.");
        } catch (IOException ie) {
            System.out.println("IOException for client " + clientId + ": " + ie.getMessage());
        } catch (Exception e) {
            System.out.println("Error in ServerThread for client " + clientId + ": " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (is != null) is.close();
                if (od != null) od.close();
                if (s1 != null) s1.close();
            } catch (IOException e) {
                System.err.println("Error closing resources for client " + clientId + ": " + e.getMessage());
            }
            // Ensure removal from lists if an exception occurred before normal removal
            synchronized(mserver.clientWriters) {
                int idx = mserver.clientWriters.indexOf(od);
                if (idx != -1) {
                    mserver.clientWriters.remove(idx);
                    mserver.clientIds.remove(idx);
                    System.out.println("Cleaned up client " + clientId + " from lists after an error.");
                }
            }
        }
    }
}