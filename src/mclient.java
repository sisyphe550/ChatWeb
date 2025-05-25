import java.util.*;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class mclient {

    public static void main(String s[]) throws Exception {
        System.setProperty("java.net.preferIPv4Stack", "true");

        Socket s1_socket = null; // Renamed to avoid conflict with argument 's'
        BufferedReader br = null;
        final BufferedReader socket_reader;
        final PrintWriter socket_writer;

        try {
            s1_socket = new Socket("localhost", 9998);
            br = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
            socket_reader = new BufferedReader(new InputStreamReader(s1_socket.getInputStream(), StandardCharsets.UTF_8));
            socket_writer = new PrintWriter(new OutputStreamWriter(s1_socket.getOutputStream(), StandardCharsets.UTF_8), true);
        } catch (IOException e) {
            System.err.println("IO Exception during connection setup: " + e.getMessage());
            if (s1_socket != null) { try { s1_socket.close(); } catch (IOException ex) { /* ignore */ } }
            return; // Exit if setup fails
        }

        final Socket final_s1_socket = s1_socket; // Create a final copy for the lambda

        System.out.println("Enter data to server (enter QUIT to end) :-> " + final_s1_socket.getRemoteSocketAddress().toString());

        // Thread for receiving messages from server
        // 'socket_reader' is final, so it can be used in the lambda
        Thread readerThread = new Thread(() -> {
            String res;
            try {
                while ((res = socket_reader.readLine()) != null) {
                    System.out.println("server response :-> " + res);
                }
            } catch (IOException e) {
                if (Thread.currentThread().isInterrupted()) {
                    System.out.println("Reader thread interrupted and exiting.");
                } else if (final_s1_socket.isClosed() || !final_s1_socket.isConnected()){
                    System.out.println("Socket closed, reader thread exiting.");
                }else {
                    System.out.println("socket read error: " + e.getMessage());
                }
            }
        });
        readerThread.start();

        // Main thread for sending messages
        try {
            String line;
            while ((line = br.readLine()) != null && !line.equals("QUIT")) {
                socket_writer.println(line);
            }
            // Send QUIT message to server if not already sent by loop condition
            if (line != null && line.equals("QUIT")) {
                socket_writer.println(line);
            }
            readerThread.interrupt(); // Interrupt the reader thread
            // Close resources in a specific order
            if (socket_writer != null) socket_writer.close();
            if (br != null) br.close();
            if (socket_reader != null) socket_reader.close();
            // Close the original s1_socket, not the final copy (though they point to the same object)
            if (s1_socket != null) s1_socket.close();
            System.out.println("close connection ");
        } catch (IOException e) {
            System.out.println("socket write/close error: " + e.getMessage());
        } // Note: It might be better to have a finally block for closing resources
          // to ensure they are closed even if other exceptions occur in the try block above.
          // However, the current structure closes them on normal QUIT or if an IOException occurs during write.
    }
}