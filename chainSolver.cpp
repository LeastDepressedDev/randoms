#include <iostream>
#include <vector>
#include <math.h>
#include <set>
#define UDEF_V -1488

using namespace std;

void v_error(char* error) {
    printf("Validation error: %s", error);
}

template<typename T>
bool in_vec(std::vector<T> vec, T elem) {
    for (T p : vec) {
        if (elem == p) return true;
    }
    return false;
}

class elem
{
public:
    long double I = UDEF_V;
    long double U = UDEF_V;
    long double R = UDEF_V;
    std::vector<elem*> next;
    std::vector<elem*> prev;
    elem() {
        this->next = std::vector<elem*>();
        this->prev = std::vector<elem*>();
    }

    elem* to(elem* part) {
        this->next.push_back(part);
        part->prev.push_back(this);
        return this;
    }

    elem* from(elem* part) {
        this->prev.push_back(part);
        part->next.push_back(this);
        return this;
    }

    elem* replacePrev(elem* k, elem* v) {
        for (size_t i = 0; i < this->prev.size(); i++) {
            if (this->prev[i] == k) {
                this->prev[i] = v;
                return this;
            }
        }
        return this;
    }

    elem* replaceNext(elem* k, elem* v) {
        for (size_t i = 0; i < this->next.size(); i++) {
            if (this->next[i] == k) {
                this->next[i] = v;
                return this;
            }
        }
        return this;
    }

    elem* excludeNexts(std::vector<elem*> excl) {
        std::vector<elem*> nw;
        for (elem* p : this->next) {
            if (in_vec(excl, p)) continue;
            nw.push_back(p);
        }
        this->next = nw;
        return this;
    }

    elem* excludePrevs(std::vector<elem*> excl) {
        std::vector<elem*> nw;
        for (elem* p : this->prev) {
            if (in_vec(excl, p)) continue;
            nw.push_back(p);
        }
        this->prev = nw;
        return this;
    }
};

typedef class elem wire;

void mergeElements(elem* begin, elem* end, elem* R) {
    R->prev = begin->prev;
    R->next = end->next;
    for (elem* e : begin->prev) {
        e->replaceNext(begin, R);
    }
    for (elem* e : end->next) {
        e->replacePrev(end, R);
    }
}

class chain
{
public:
    std::vector<wire*> wires;
    std::vector<elem*> apls;
    chain(std::vector<elem*> apls, std::vector<wire*> wires) {
        this->wires = wires;
        this->apls = apls;
    }

    void rmWire(wire* w) {
        std::vector<wire*> nw;
        for (wire* p : this->wires) {
            if (p == w) continue;
            nw.push_back(p);
        }
        this->wires = nw;
    }

    void rmApls(std::vector<elem*> vec) {
        std::vector<elem*> nw;
        for (elem* p : this->apls) {
            if (in_vec(vec, p)) {
                continue;
            }
            nw.push_back(p);
        }
        this->apls = nw;
    }

    void inc() {
        for (elem* e : this->apls) {
            if (e->R == UDEF_V) {
                if (e->I != UDEF_V && e->U != UDEF_V) e->R = e->U/e->I;
            }
            if (e->U == UDEF_V) {
                if (e->I != UDEF_V && e->R != UDEF_V) e->U = e->I*e->R;
            }
            if (e->I == UDEF_V) {
                if (e->U != UDEF_V && e->R != UDEF_V) e->I = e->U/e->R;
            }
        }
    }

    bool shrink() {
        if (this->apls.size() == 1) return false;
        for (wire* w : this->wires) {
            if (w->next.size() == 1 && w->prev.size() == 1) {
                //printf("%Lf : %Lf\n", w->next[0]->R, w->prev[0]->R);
                if (w->next[0]->R != UDEF_V && w->prev[0]->R != UDEF_V) {
                    if (w->next[0]->I != w->prev[0]->I) {
                        v_error("Unequivalent I for straight connection.");
                        return false;
                    }
                    elem* R = new elem();
                    R->R = w->next[0]->R + w->prev[0]->R;
                    R->I = w->prev[0]->I;
                    R->U = R->I*R->R;
                    mergeElements(w->prev[0], w->next[0], R);
                    rmApls({w->prev[0], w->next[0]});
                    rmWire(w);
                    this->apls.push_back(R);
                    printf("New straight: %Lf\n", R->R);
                    return true;
                }
            } else if (w->prev.size() != 1) {
                bool flag = false, flag2 = false;
                std::set<wire*> pts;
                long double sumR = 0, sumI = 0;
                for (elem* p : w->prev) {
                    if (p->R == UDEF_V) flag = true;
                    pts.insert(p->prev[0]);
                    sumR += 1/p->R;
                    if (p->I == UDEF_V) flag2 = true;
                    sumI += p->I;
                }
                if (flag || pts.size() != 1) continue;
                // for (elem* v : w->prev) {
                //     printf("!%Lf ", v);
                // }
                elem* R = new elem();
                R->R = 1/sumR;
                R->U = w->prev[0]->U;
                R->I = flag2 ? UDEF_V : sumI;
                rmApls(w->prev);
                for (wire* pt : pts) {
                    pt->excludeNexts(w->prev);
                    w->prev.clear();
                    w->from(R);
                    pt->to(R);
                    break;
                }
                this->apls.push_back(R);
                printf("New parallel: %Lf\n", R->R);
                return true;
            }
        }
        return false;
    }
};


chain genChain() {
    //General definition
    elem* src = new elem();
    src->R = 1;
    //Configuration
    //
    //
    //Definitions
    elem* R1 = new elem();
    R1->R = 4;
    elem* R2 = new elem();
    R2->R = 3;
    elem* R3 = new elem();
    R3->R = 12;
    elem* R4 = new elem();
    R4->R = 6;

    //Wires and stuff
    wire* w1 = (new wire())->from(src)->to(R1)->to(R3)->to(R4);
    wire* w2 = (new wire())->from(R1)->from(R3)->to(R2);
    wire* w3 = (new wire())->from(R4)->from(R2)->to(src);

    //
    //
    //

    //Genearal return
    return chain({src, R1, R2, R3, R4}, {w1, w2, w3});
}

int main() {
    chain c = genChain();
    while (c.shrink()) {
        for (auto v : c.apls) {
            printf("%Lf ", v->R);
        }
        printf("\n");
        c.shrink();
    }
    return 0;
}