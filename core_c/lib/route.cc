#include <string.h>

namespace Route {

    int Index = 0;

    const int stepTab = 15;

    struct collectOr {
        int *index;
        int cmp = 0;
        bool end;
    };

    char * tab[100]  = {};
    struct collectOr tabL[100]  = {};

    int Match(char* param1,int size) {
    
        if(tabL[size].cmp > 0){
            for(int i = 0 ; i < tabL[size].cmp ; i++){
                if(strcmp(tab[tabL[size].index[i]], param1) == 0){
                    return(tabL[size].index[i]+1);
                } 
            }
        }
        return 0;
    }

    void Route(char* param1) {

        int size = strlen(param1);
        
        if(!tabL[size].index) {
            tabL[size].index = (int*) malloc( stepTab * sizeof (int));
        }
        tabL[size].index[tabL[size].cmp] = Index;
        tabL[size].cmp ++;

        tab[Index] =(char*) malloc( size * sizeof (char));
        strcpy(tab[Index],param1);
        Index++;

    }
}