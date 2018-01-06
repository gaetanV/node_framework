#include <string.h>

namespace ParamRoute {

    int Index = 0;

    const int stepTab = 15;
    const char paramChar = '$';

    struct collectOr {
        int *index;
        int cmp = 0;
        bool end;
    };

    struct collectOr indextabL[100]  = {};
    char * tab[100]  = {};

    bool _matchEgal(
        char* a,
        int aPos, 
        char* b , 
        int bPos, 
        int len
    ){
        for(int i = 0; i < len  ; i++){
            if(a[i+aPos] != b[i+bPos]){
                return false;
            }
        }
        return true;
    }

    int _match(    
        char* a,
        int aPos, 
        char* b , 
        int bPos, 
        int len,
        int max
    ){

        for(int i = 0; i < max - aPos  ; i++){
            if(a[aPos+i] == b[bPos]){
                if(_matchEgal(
                    a,
                    aPos+i,
                    b,
                    bPos,
                    len
                )){
                    return i;
                }
            }
        } 
        return -1;
    }

    int  _firstPass(
        int paramStart,
        int index,
        char* param1 ,
        int posParam,
        int size,
        struct collectOr *buffer
    ){

        if(posParam+1 < indextabL[index].cmp){
            
            int lenSecond = indextabL[index].index[posParam+1] - indextabL[index].index[posParam] -1;
            
            int match = _match(
                param1,
                paramStart,
                tab[index],
                indextabL[index].index[posParam]+1,
                lenSecond,
                size
            );

            if(match != -1 ){
                buffer->index[buffer->cmp++] = (paramStart);
                buffer->index[buffer->cmp++] = match + (paramStart);
                return match+lenSecond;
            }
        }
    
        return -1;
    }

    int Match(char* param1,int size) {

        int paramStart;

        for(int index = 0 ; index < Index ; index++){

            printf("MATCH: %s  \n",tab[index]); 
            paramStart = 0;

            if(indextabL[index].cmp>1 && _matchEgal(
                param1,
                paramStart,
                tab[index],
                0,
                indextabL[index].index[0]
            )){
                paramStart += indextabL[index].index[0];
               
                struct collectOr buffer;
                collectOr *bufferP= &buffer;
                bufferP->index = (int*) malloc( (indextabL[index].cmp-1) * 2  * sizeof (int));

                int j=0;
                if(indextabL[index].end){
                    for( ; j < indextabL[index].cmp-2 ; j++){
                        int match = _firstPass(
                            paramStart,
                            index,
                            param1,
                            j,
                            size,
                            bufferP
                        );  
                        if(match == -1){
                            break;
                        } 
                        paramStart += match;
                    }
                    bufferP->index[bufferP->cmp++] = (paramStart);
                    bufferP->index[bufferP->cmp++] = size;


                    j++;
                    paramStart = size; 
                    
                } else{
                    for( ; j < indextabL[index].cmp-1 ; j++){
                        int match = _firstPass(
                            paramStart,
                            index,
                            param1,
                            j,
                            size,
                            bufferP
                        );  
                        if(match == -1){
                            break;
                        } 
                        paramStart += match;
                    }
                    
                }
    
                if(j == indextabL[index].cmp-1 && size == paramStart ){
                    
                    printf("MATCH %d  %d:%d\n",Index,j,indextabL[index].cmp-1);

                    for(int k = 0 ; k < bufferP->cmp  ; k+=2){
                        for(int i = bufferP->index[k]; i< bufferP->index[k+1]; i++){
                            printf("%c",param1[i]);
                        }
                        printf("\n");
                    }
                    
                    return index;
                }
                
                free(bufferP);
            }
        }
        return 0;
    }

    void Route(char* param1) {

        int size = strlen(param1);

        tab[Index] =(char*) malloc( size * sizeof (char));
        strcpy(tab[Index],param1);

        if(!indextabL[Index].index) {
            indextabL[Index].index = (int*) malloc( stepTab * sizeof (int));
        }

        for(int i = 1 ; i < size ; i++){
            if(param1[i] == paramChar){
                indextabL[Index].index[indextabL[Index].cmp] = i;
                indextabL[Index].cmp++;
            }
        }

        indextabL[Index].end = indextabL[Index].index[indextabL[Index].cmp-1] == size-1;
        indextabL[Index].index[indextabL[Index].cmp] = size;
        indextabL[Index].cmp++;
        
        Index++;
    }

}




