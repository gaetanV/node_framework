namespace Route {

    #include <string.h>
    #include "param.cc"
    
    int Index = 0;

    const int STEPTAB = 15;

    struct Collector {
        int *index;
        int cmp = 0;
        bool end;
    };

    char * tab[100]  = {};
    struct Collector tabL[100]  = {};

    int FastMatch(char* param1,int size) {
        if(tabL[size].cmp > 0){
            for(int i = 0 ; i < tabL[size].cmp ; i++){
                if(strcmp(tab[tabL[size].index[i]], param1) == 0){
                    return(tabL[size].index[i]+1);
                } 
            }
        }
        return 0;
    }

    int Match(char* param1) {
        int i= 0; 
        for(i ; param1[i]; ++i){
            if(param1[i] == Param::CH_MARK){
                if(tabL[i].cmp > 0){
                    for(int k = 0 ; k < tabL[i].cmp ; k++){
                        if(memcmp ( tab[tabL[i].index[k]], param1, i ) == 0){
                            Param::Param(
                                param1,
                                strlen(param1),
                                i + 1 
                            );
                            return tabL[i].index[k]+1;
                        } 
                    }
                } 
            }
        }
        return FastMatch(param1,i);
    }

    void Route(char* param1) {

        int size = strlen(param1);

        if(!tabL[size].index) {
            tabL[size].index = (int*) malloc( STEPTAB * sizeof (int));
        }
        tabL[size].index[tabL[size].cmp] = Index;
        tabL[size].cmp ++;

        tab[Index] =(char*) malloc( size * sizeof (char));
        strcpy(tab[Index],param1);
        Index++;

    }
}