/**
 * Will You Be My Valentine? — Console (native) version, Java
 *
 * Compile: javac java/Valentine.java
 * Run:     java -cp java Valentine
 *
 * Asks "Will you be my Valentine? (yes/no)". On "yes" -> celebrate and exit.
 * On "no" -> playful message, increase visual "YES" footprint, re-prompt.
 * Case-insensitive; trims whitespace.
 */

import java.util.Scanner;

public class Valentine {

    /** Trim leading and trailing whitespace. */
    private static String trim(String s) {
        if (s == null) return "";
        return s.trim();
    }

    /** Return lowercase copy. */
    private static String toLower(String s) {
        if (s == null) return "";
        return s.toLowerCase();
    }

    /** Print a simple "YES" banner; size controls how many lines (visual growth). */
    private static void printYesBanner(int size) {
        int lines = Math.max(1, Math.min(size, 5));
        for (int i = 0; i < lines; i++) {
            System.out.println("  ***   Y E S   ***");
        }
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        System.out.println("Will you be my Valentine? (yes/no)");

        int yesScale = 1;  // each "no" increases the visual YES

        while (in.hasNextLine()) {
            String line = in.nextLine();
            String answer = toLower(trim(line));

            if ("yes".equals(answer) || "y".equals(answer)) {
                System.out.println();
                printYesBanner(yesScale);
                System.out.println("\n  YAY — you said YES! Thank you! <3\n");
                in.close();
                return;
            }

            if ("no".equals(answer) || "n".equals(answer)) {
                yesScale += 1;
                System.out.println("No teleported to a new spot! Try again.");
                printYesBanner(yesScale);
                System.out.println("\nWill you be my Valentine? (yes/no)");
                continue;
            }

            System.out.println("Please type yes or no.");
        }

        in.close();
    }
}
