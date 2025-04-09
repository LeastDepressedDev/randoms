#include <iostream>
#include <vector>
#include <math.h>
#include <map>
#include <list>
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
    //chain*
    void* sub_chain = nullptr;
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

    void* expand();
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
    elem* src;
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
                    if (w->next[0]->I != w->prev[0]->I && w->next[0]->I != UDEF_V && w->prev[0]->I != UDEF_V) {
                        v_error("Unequivalent I for straight connection.");
                        return false;
                    }
                    elem* R = new elem();
                    R->R = w->next[0]->R + w->prev[0]->R;
                    R->I = w->prev[0]->I;
                    R->U = R->I*R->R;

                    wire* w1 = (new wire())->from(w->next[0])->to(R);
                    wire* w2 = (new wire())->from(R)->to(w->prev[0]);
                    R->sub_chain = new chain({R, w->next[0], w->prev[0]}, {w, w1, w2});
                    ((chain*)R->sub_chain)->src = R;

                    mergeElements(w->prev[0], w->next[0], R);
                    rmApls({w->prev[0], w->next[0]});
                    rmWire(w);
                    this->apls.push_back(R);
                    printf("New straight: %Lf\n", R->R);
                    return true;
                }
            } else if (w->prev.size() != 1) {
                std::map<elem*, std::vector<elem*>> mapper;
                for (elem* p : w->prev) {
                    if (mapper.count(p->prev[0]) == 1) {
                        mapper[p->prev[0]].push_back(p);
                    } else {
                        mapper[p->prev[0]] = std::vector<elem*>();
                        mapper[p->prev[0]].push_back(p);
                    }
                }

                for (std::pair<elem*, std::vector<elem*>> pr : mapper) {
                    if (pr.second.size() > 1) {
                        bool flag = false, flag2 = false;
                        long double sumR = 0, sumI = 0;
                        for (elem* p : pr.second) {
                            if (p->R == UDEF_V) {
                                flag = true;
                                break;
                            }
                            sumR += 1/p->R;
                            if (p->I == UDEF_V) flag2 = true;
                            sumI += p->I;
                        }
                        if (flag) continue;
                        // for (elem* v : w->prev) {
                        //     printf("!%Lf ", v);
                        // }
                        elem* R = new elem();
                        R->R = 1/sumR;
                        R->U = w->prev[0]->U;
                        R->I = flag2 ? UDEF_V : sumI;

                        std::vector<elem*> subc_vec = std::vector<elem*>(pr.second);
                        wire* w1 = (new wire())->from(R);
                        wire* w2 = (new wire())->to(R);
                        for (elem* ele : subc_vec) {
                            w1->to(ele);
                            w2->from(ele);
                        }
                        subc_vec.push_back(R);
                        R->sub_chain = new chain(subc_vec, {w1, w2});
                        ((chain*)R->sub_chain)->src = R;

                        pr.first->excludeNexts(pr.second);
                        w->excludePrevs(pr.second);
                        pr.first->to(R);
                        w->from(R);
                        
                        this->rmApls(pr.second);
                        this->apls.push_back(R);
                        printf("New parallel: %Lf\n", R->R);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    void recursive_expand() {
        for (elem* a : this->apls) {
            chain* ptr = (chain*) a->expand();
            if (ptr == this) continue;
            if (ptr != nullptr) ptr->recursive_expand();
        }
    }
};

#define SKIP return nullptr;
void* elem::expand() {
    if (this->sub_chain != nullptr) {
        chain* c = (chain*) this->sub_chain;
        c->inc();
        if (c->wires.size() == 3) {
            if (this->I == UDEF_V) SKIP;
            for (elem* e : c->apls) {
                e->I = this->I;
            }
            c->inc();
        }
        else if (c->wires.size() == 2) {
            if (this->U == UDEF_V) SKIP;
            for (elem* e : c->apls) {
                e->U = this->U;
            }
            c->inc();
        }
    }
    return this->sub_chain;
}
#undef SKIP


// chain @ default_resistors_vec
std::pair<chain, std::vector<elem*>> genChain() {
    //General definition
    elem* src = new elem();
    src->R = 0;
    src->U = 160;
    //Configuration
    //
    //
    //Definitions
    elem* R1 = new elem();
    R1->R = 5;
    elem* R2 = new elem();
    R2->R = 5;
    elem* R3 = new elem();
    R3->R = 5;
    elem* R4 = new elem();
    R4->R = 10;
    elem* R5 = new elem();
    R5->R = 10;
    elem* R6 = new elem();
    R6->R = 10;
    elem* R7 = new elem();
    R7->R = 10;

    //Wires and stuff
    wire* w1 = (new wire())->from(src)->to(R1);
    wire* w2 = (new wire())->from(R1)->to(R4)->to(R2);
    wire* w3 = (new wire())->from(R2)->to(R5)->to(R3);
    wire* w4 = (new wire())->from(R3)->to(R6)->to(R7);
    wire* w5 = (new wire())->from(R4)->from(R6)->from(R5)->from(R7)->to(src);

    //
    //
    //

    std::vector<elem*> res_vec = {src, R1, R2, R3, R4, R5, R6, R7};

    //Genearal return
    chain c = chain(std::vector<elem*>(res_vec), {w1, w2, w3, w4, w5});
    c.src = src;
    return std::pair<chain, std::vector<elem*>>(c, res_vec);
}

int main() {
    std::pair<chain, std::vector<elem*>> inp = genChain();
    chain c = inp.first;
    //c.inc();
    while (c.shrink()) {
        for (auto v : c.apls) {
            printf("%Lf ", v->R);
        }
        printf("\n");
    }
    c.src->R = c.apls[0]->R;
    c.apls[0]->U = c.src->U;
    c.apls[1]->I = c.src->I;

    c.recursive_expand();
    int i = 0;
    for (elem* e : inp.second) {
        printf("R%d->{I: %Lf, U: %Lf, R: %Lf};\n", i, e->I, e->U, e->R);
        i++;
    }
    printf("\nFull chain built\n");
    return 0;
}