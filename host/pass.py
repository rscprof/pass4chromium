#!/usr/bin/env python
import json;
import sys;
import os;
import struct;
import subprocess;
 #text_length_bytes=sys.stdin.read (4)
#if len (text_length_bytes)==0:
#  sys.exit(0)
  
#text_length=struct.unpack('i',text_length_bytes)[0]
#text=sys.stdin.read (text_length).decode('utf-8')
#if text == 'ls':
#  do_ls;

#do_ls()

def send_text (lists):
  text = json.dumps (lists).encode('utf-8')
  sys.stdout.buffer.write (struct.pack ('i',len(text)))
  sys.stdout.buffer.write (text);
#  f = open ('/home/rscprof/develop/chromium-pass/host/log','w')
#  f.write (json.dumps(lists))
#  f.close();
  sys.stdout.flush();

  
def do_ls(): #show all files in password store in JSON
  lists = getListDir ("/home/rscprof/.password-store") #TODO get name from settings
  send_text (lists)
  
def do_show(path):
    p = subprocess.Popen("/usr/bin/pass show %s" % path, shell=True,
                        stdout=subprocess.PIPE)
    out = p.stdout.read().decode('utf-8')
    send_text (out)

  
def getListDir (name):
  dict = {}
#  lastkey=""
  listpass=[]
  for root,dirs,files in os.walk (name,False):
    if root[-5:]!="/.git":
      listpass = []
      for f in files:
        if f[-4:]==".gpg":
          listpass = listpass+[f[:-4]]
      for d in dirs:
        if d!=".git":
          listpass = listpass+[dict[os.path.join(root,d)]]
      dict[root]=[os.path.basename(root)]+listpass
#      lastkey=root;
  return listpass
  
#do_ls()


while 1:
  text_length_bytes=sys.stdin.buffer.read (4)
  if len (text_length_bytes)==0:
    sys.exit(0)
  
  text_length=struct.unpack('i',text_length_bytes)[0]
  text=sys.stdin.buffer.read (text_length).decode('utf-8')
  message = json.loads(text)
  f = open ('/home/rscprof/develop/chromium-pass/host/log','w')
  f.write (message["command"])
  f.close();
  
  if message["command"] == 'ls':
    do_ls();
  if message["command"] == 'show':
    do_show(message["path"]);
