namespace Tools {

    #include <node.h>

    using v8::String;
    using v8::Local;

    char* ToCString(Local<String> str) {
        String::Utf8Value value(str);
        return *value;
    }
    
}