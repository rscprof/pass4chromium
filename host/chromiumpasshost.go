package main

import (
	"os"
	"bytes"
	"encoding/json"
	"log"
	"encoding/binary"
	"path"
	"os/user"
	"os/exec"
	"strings"
)

type dirStructure map[string]*dirStructure


func getListDir (dir string) (*dirStructure,error) {
	result:=make(dirStructure)
	fileDir,e:=os.Open (dir)
	if e!=nil {return nil,e}
	fileInfoSlice,e2:=fileDir.Readdir(0)
	if e:=fileDir.Close ();e!=nil {return nil,e}
	if e2!=nil {return nil,e2}
	
	for _,fi:=range fileInfoSlice {
		if fi.IsDir() {
			if fi.Name()!=".git" {
				subdir,e:=getListDir(dir+"/"+fi.Name())
				if e!=nil {return nil,e}
				result[fi.Name()]=subdir
			}} else
			{
				if path.Ext(fi.Name())==".gpg" {

					result[fi.Name()[:(len(fi.Name())-4)]]=nil
				}
			}
		
	}
	return &result,nil
}

func doShow (l * log.Logger,path string) {
	out,err:=exec.Command("pass","show",path).Output()
	if err!=nil {
		sendError (l,err.Error())
		return
	}
	type S struct{Password string}
//	l.Println (string(out))
	send(l,S{strings.TrimRight(string(out),"\n")})
}

func doLs (l *log.Logger) {
	dir,flag := os.LookupEnv ("PASSWORD_STORE_DIR")
	if flag==false {
		dir="~/.password-store"
	}
	if len(dir)>2&&dir[:2]=="~/" {
		user,e:=user.Current()
		if e!=nil{
			sendError (l,e.Error())
			return
		}
		dir = user.HomeDir+dir[1:]
	}

	lists,e := getListDir (dir)
	if e!=nil {
		sendError (l,e.Error())
		return
	}
	type resultForJson struct {Ls *dirStructure}

	send(l,resultForJson{lists})

}

func send (l *log.Logger,v interface {} ) {
 	b,e:=json.Marshal (v)
	if e!=nil {
		l.Println ("Error json marshal")
		return
	}
//	length:=uint32(len(b))
	e=binary.Write  (os.Stdout,binary.LittleEndian,uint32(len(b)))
	if e!=nil {
		l.Println ("Error send length of  message ")
		return
	}
	{
		n,e:=os.Stdout.Write (b)
		if e!=nil {
			l.Println ("Error send  message ")
			return
		}
		if n!=len(b) {
			l.Println ("Errof send whale message ")
			return
		}
	}
	
}

func sendError (l *log.Logger,s string) {
	type errorForJson struct {Error string }

	send (l,errorForJson{s})
}

func main () {
	l:=log.New (os.Stderr,"",0)
//	doShow (l,"vk.com/rscprof")
//	doLs(l)
	for {
		//Read length of message
		var length uint32
		{
			lengthBytes:=make ([]byte,4)
			count,e:=os.Stdin.Read (lengthBytes)
			if e!=nil {
				sendError (l,"Read of length: "+e.Error())
				continue
			}
			if count!=4 {
				sendError (l,"Length of message isn't equal to 4")
				continue
			}
			//convert bytes array to uint32
			readerLength := bytes.NewReader (lengthBytes)
			if readerLength==nil {
				sendError (l,"Error of creating reader for length")
				continue
			}
			err:=binary.Read (readerLength,binary.LittleEndian,&length)
			if err!=nil {
				sendError (l,"Error of convert to uint32 length")
				continue
			}
		}

		//Read message
		messageBytes:=make ([]byte,length)
		count,e:=os.Stdin.Read (messageBytes)
		if e!=nil {
			sendError (l,"Read of message: "+e.Error())
			continue
		}
		if uint32(count)!=length {
			sendError (l,"Read of part of message")
			continue
		}
//		message:=string(messageBytes)
		
		type messageStruct struct {
			Command string
			Path 	string
		}
		
		var message messageStruct

		err:=json.Unmarshal (messageBytes,&message)

		if err!=nil {
			sendError (l,"Encoding message "+err.Error())
			continue
		}

		switch message.Command {
			case "show": doShow(l,message.Path)
			case "ls":	doLs (l)
			default: sendError (l,"Unknown command "+message.Command)
		}


	}
}
