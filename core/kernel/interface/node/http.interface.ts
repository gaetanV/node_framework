interface HttpServeurInterface{
    listen(string,number):void;  
}
interface HttpInterface {
    createServer(EpxressInterface):HttpServeurInterface;
}