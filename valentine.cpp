/**
 * Will You Be My Valentine? — Console (native) version, C++
 *
 * Build: g++ -std=c++17 -O2 -o valentine cpp/valentine.cpp
 * Run:   ./valentine   (or valentine.exe on Windows)
 *
 * Asks "Will you be my Valentine? (yes/no)". On "yes" -> celebrate and exit.
 * On "no" -> playful message, increase visual "YES" footprint, re-prompt.
 * Case-insensitive; trims whitespace.
 */

#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>

/** Trim leading and trailing whitespace (C++17-friendly, no boost). */
static std::string trim(const std::string& s) {
    auto start = s.find_first_not_of(" \t\r\n");
    if (start == std::string::npos) return "";
    auto end = s.find_last_not_of(" \t\r\n");
    return s.substr(start, end - start + 1);
}

/** Return a lowercase copy of s. */
static std::string to_lower(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(),
                  [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return s;
}

/** Print a simple "YES" banner; size controls how many lines (visual growth). */
static void print_yes_banner(int size) {
    const int lines = std::max(1, std::min(size, 5));
    for (int i = 0; i < lines; ++i) {
        std::cout << "  ***   Y E S   ***\n";
    }
}

int main() {
    std::cout << "Will you be my Valentine? (yes/no)\n";

    int yes_scale = 1;  // each "no" increases the visual YES

    for (;;) {
        std::string line;
        if (!std::getline(std::cin, line)) break;

        std::string answer = to_lower(trim(line));

        if (answer == "yes" || answer == "y") {
            std::cout << "\n";
            print_yes_banner(yes_scale);
            std::cout << "\n  YAY — you said YES! Thank you! <3\n\n";
            return 0;
        }

        if (answer == "no" || answer == "n") {
            yes_scale += 1;
            std::cout << "No teleported to a new spot! Try again.\n";
            print_yes_banner(yes_scale);
            std::cout << "\nWill you be my Valentine? (yes/no)\n";
            continue;
        }

        std::cout << "Please type yes or no.\n";
    }

    return 0;
}
