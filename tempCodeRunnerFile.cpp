#include <iostream>
#include <vector>
#include <map>

using namespace std;

const int MAX_HUBS = 1001;
int parent[MAX_HUBS]; // Parent array for Union-Find
int size[MAX_HUBS];   // Size array for Union-Find to optimize

// Store toll fees for roads between hubs
map<pair<int, int>, int> tollFees;

// Find function for Union-Find to get the parent of a hub
int findParent(int hub) {
    if (parent[hub] != hub) {
        parent[hub] = findParent(parent[hub]); // Path compression
    }
    return parent[hub];
}

// Union function for Union-Find to join two hubs
void unite(int hub1, int hub2) {
    int root1 = findParent(hub1);
    int root2 = findParent(hub2);
    if (root1 != root2) {
        // Union by size: attach smaller tree under larger tree
        if (size[root1] < size[root2]) {
            parent[root1] = root2;
            size[root2] += size[root1];
        } else {
            parent[root2] = root1;
            size[root1] += size[root2];
        }
    }
}

int main() {
    int q; // Number of events
    cin >> q;
    
    // Initially, each hub is its own parent, and the size of each component is 1
    for (int i = 1; i <= MAX_HUBS; ++i) {
        parent[i] = i;
        size[i] = 1;
    }

    while (q--) {
        int x, y;
        cin >> x >> y;

        if (x == 1) { // Toll update event
            int toll;
            cin >> toll;
            tollFees[{min(y, x), max(y, x)}] = toll; // Set the toll fee for the road between hubs
            unite(y, x); // Union the hubs since they are now connected
        } 
        else if (x == 2) { // Travel event
            int totalToll = 0;
            int start = y, end = y;
            int rootStart = findParent(start);

            // Traverse the path between start and end hubs
            while (start != end) {
                if (tollFees.find({min(start, end), max(start, end)}) != tollFees.end()) {
                    totalToll += tollFees[{min(start, end), max(start, end)}];
                }
                start = findParent(start);
            }
            cout << totalToll << endl; // Print the total toll cost
        }
    }
    
    return 0;
}
