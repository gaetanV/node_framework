namespace Param {
    
    #include <string.h>

   struct Buffer {
        int *index;
        int cmp = 0;
    };

    const char CH_AND = '&';
    const char CH_MARK = '?';
    const char CH_EGAL = '=';

    int Param(char* param1,int size,int pos) {
        int posInit = pos;
        struct Buffer buffer;
        buffer.index =(int*) malloc( (size-pos)/2 * sizeof (int));

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
        
        for(int k = 0 ; k < buffer.cmp  ; k++){
            for(;posInit < (buffer.index[k]) ; posInit++){
                printf("%c",param1[posInit]);
            }
            posInit++;
            printf("\n");
        }
        free(buffer.index);
        printf("***\n");
        return pos;
 
    }

}