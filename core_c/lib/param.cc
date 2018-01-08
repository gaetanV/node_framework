#include <string.h>

namespace Param {

   struct Buffer {
        int *index;
        int cmp = 0;
    };

    const char CH_AND = '&';
    const char CH_MARK = '?';
    const char CH_EGAL = '=';

    void Param(char* param1,int size) {

        int pos = 0;
        struct Buffer buffer;
        buffer.index =(int*) malloc( size/2 * sizeof (int));

        if(param1[0]==CH_MARK){
step1:
           for (;pos<size;pos++){
                if(param1[pos]==CH_EGAL){
                    buffer.index[buffer.cmp++] = pos;
                    goto step2;
                }
           }
           goto end;
step2:
           for (;pos<size;pos++){
                if(param1[pos]==CH_AND){
                     buffer.index[buffer.cmp++] = pos;
                    goto step1;
                }
           }
end:
            buffer.index[buffer.cmp++] = pos;
            pos = 1;
            for(int k = 0 ; k < buffer.cmp  ; k++){
                for(;pos < (buffer.index[k]) ; pos++){
                    printf("%c",param1[pos]);
                }
                pos++;
                printf("\n");
            }
            free(buffer.index);
            printf("***\n");
        }
    }   

}