#include <stdio.h>
#include <stdlib.h>
#include <random>

int main() {
    std::srand(10);
    int res = std::rand()%10;
    printf("%d\n", res);
    return 0;
}