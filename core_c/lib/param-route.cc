#include <string.h>

namespace ParamRoute {

    int Index = 0;

    const int STEPTAB = 15;
    const char CH_PARAM = '$';

    struct Buffer {
        int *index;
        int cmp = 0;
    };

    struct Collector {
        int *index;
        int cmp = 0;
        bool end;
    };

    struct Collector indextabL[100]  = {};
    char * tab[100]  = {};

    int Match(char* param1,int size) {

        int paramStart;

        for(int index = 0 ; index < Index ; index++){

            printf("MATCH: %s  \n",tab[index]); 
            paramStart = 0;
            // matchEgal
            for(int i = 0; i < indextabL[index].index[0]  ; i++){
                if(param1[i+paramStart] != tab[index][i]){
                    continue;
                }
            }

            paramStart += indextabL[index].index[0];
            
            struct Buffer buffer;
            buffer.index = (int*) malloc( (indextabL[index].cmp-1) * 2  * sizeof (int));

       
            int max = indextabL[index].end? indextabL[index].cmp-2: indextabL[index].cmp-1;
            int i=0;
            for( ; i < max;){
                // matchStep
                if(i+1 < indextabL[index].cmp){
                            
                    int lenSecond = indextabL[index].index[i+1] - indextabL[index].index[i] -1;
                    int posB = indextabL[index].index[i]+1;
                    // match
                    for(int j = 0; j < size - paramStart  ; j++){

                        if(param1[paramStart+j] == tab[index][posB]){
                            // matchEgal
                            for(int k = 0; k < lenSecond  ; k++){
                                if(param1[k+paramStart+j] != tab[index][k+posB]){
                                    goto end;
                                }
                            }
                            buffer.index[buffer.cmp++] = (paramStart);
                            buffer.index[buffer.cmp++] = j + (paramStart);
                            paramStart += j+lenSecond;
                        }

                    } 

                }
end:
              i++;
            }

            if(indextabL[index].end){
                buffer.index[buffer.cmp++] = (paramStart);
                buffer.index[buffer.cmp++] = size;
                i++;
                paramStart = size; 
            } 

            if(i == indextabL[index].cmp-1 && size == paramStart ){
                
                printf("MATCH %d  %d:%d\n",Index,i,indextabL[index].cmp-1);

                for(int j = 0 ; j < buffer.cmp  ; j+=2){
                    for(int k = buffer.index[j]; k< buffer.index[j+1]; k++){
                        printf("%c",param1[k]);
                    }
                    printf("\n");
                }
                
                return index;
            }
            
            free(buffer.index);
          
        }
        return 0;
    }

    void Route(char* param1) {

        int size = strlen(param1);

        tab[Index] =(char*) malloc( size * sizeof (char));
        strcpy(tab[Index],param1);

        if(!indextabL[Index].index) {
            indextabL[Index].index = (int*) malloc( STEPTAB * sizeof (int));
        }

        for(int i = 1 ; i < size ; i++){
            if(param1[i] == CH_PARAM){
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




