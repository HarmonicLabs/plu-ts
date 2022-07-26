# How to use the developer documentation

> **_NOTE_**: the 'developer documetation' contains documentation relevant to the ```plu-ts``` internals
> 
> these should not be relevant when developing an application using the library
> 
> this documentation is mainly useful for developer who wants to help with the developments of the project.

## documentaiton structure

the structure of the ```dev-docs``` folder follows the structire of the ```src``` one, exept for the ```dev-docs/notes``` and the ```dev-docs/best-practices``` folders (more below)

so if you are having a look at the ```src/types/bits/BitStream/index.ts``` file you will find the related documentation at ```dev-docs/types/bits/BitStream/index.md``` file

### the ```notes``` folder

eventually the implementation present in some file uses some concept shared in the project; if that is the case, rather than rewriting the same notes many times, a link to the ```dev-docs/notes``` folder will be present.

In the example of the ```BitStream``` implementation; at javascript level is implemented using a ```bigint```, and the same is true for the ```Integer``` class.

rather than rewriting relevant inforamtions regarding the ```bigint``` in both files, those two will reference the ```dev-docs/notes/bigint.md``` file.

### the ```best-practices``` folder

since this documentaiton is intended for those who wants to contribute;
in this folder are included informations about style choices and best practices adopted in the project.

## Other informations

- ```README.md``` files in the any of the ```dev-docs``` subfolder are intended as documentation for what should be present in that folder.

## ```dev-docs``` Tree

### for contributors

- [notes](./notes)
- [best-practices](./best-practices)

### ```src```-like

- [errors](./errors)
- [offchain](./offchain)
- [onchain](./onchain)
- [serialization](./serialization)
- [types](./types)
- [utils](./utils)
- [index.md](./index.md)