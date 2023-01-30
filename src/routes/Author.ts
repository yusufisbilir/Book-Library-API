import express from 'express';
import controller from '../controllers/Author';

const router = express.Router();

router.post('/create', controller.createAuthor);
router.get('/get', controller.readAllAuthor);
router.get('/get/:authorId', controller.readAuthor);
router.patch('/update/:authorId', controller.updateAuthor);
router.delete('/delete/:authorId', controller.deleteAuthor);

export = router;
