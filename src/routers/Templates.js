import { Router } from 'express';
import templateService from '../services/TemplatesService';

const router = Router();

router.get('/checkconflicts', (req, res) => {
  templateService.checkconflicts(req.query.ids, req.service)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(400).json({ message: err });
    });
});


export default router;