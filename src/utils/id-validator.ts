// import { NextFunction, Request, Response } from 'express';
// import { ObjectId } from 'mongodb';
//
// const postsRepository = new UsersRepository()
// export const idParamsValidator = (id: string, res: Response, text?: string) => {
//     try {
//         new ObjectId(id);
//     } catch (err) {
//         return res.status(HTTP_STATUSES.NOT_FOUND_404).send(text);
//     }
// }
//
// export const postIdValidator = async (req: Request, res: Response, next: NextFunction) => {
//     const postId = new ObjectId(req.params.postId)
//     const getPostById = await postsRepository.getPostByID(postId)
//     if (!getPostById) {
//         return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
//     } else {
//        return next()
//     }
//     // return res.status(HTTP_STATUSES.NOT_FOUND_404).send('postId doesn\'t exists');
// }
//
//
// //     try {
// //         const postId = new ObjectId(req.params.postId)
// //         await postsService.getPostByID(postId)
// //         return next();
// //     } catch (err) {
// //         return next(res.status(HTTP_STATUSES.NOT_FOUND_404).send('postId doesn\'t exists'));
// //     }
// //     // return next()
// // }
//
// // export const postIdValidator = async (req: Request, res: Response, next: NextFunction) => {
// //     const postId = new ObjectId(req.params.id)
// //     const getPostById = await postsRepository.getPostByID(postId)
// //     if (!getPostById) {
// //         throw new Error()
// //     } else {
// //         return true
// //     }
// //         // try {
// //         //     new ObjectId(req.params.id);
// //         // } catch (err) {
// //         //     return res.status(404).send();
// //         // }
// //         // if (!ObjectId.isValid(new ObjectId(req.params.bloggerId)) ) {
// //         //     res.sendStatus(408)
// //         // }
// //         // const id = req.params.bloggerId
// //         // if (id.match(/^[0-9a-fA-F]{24}$/)) {
// //         //    return next()
// //         // } else {
// //         //    return res.sendStatus(404)
// //         // }
// //         // let ObjectId = require(req.params.bloggerId).Types.ObjectId
// //         // if( ObjectId.isValid('microsoft123') ) {
// //         //     res.sendStatus(207)
// //         // } else {
// //         //     res.sendStatus(407)
// //         // }
// //     }