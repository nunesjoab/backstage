import { Router } from 'express';
import templateService from '../services/TemplatesService';

const router = Router();

router.get('/checkConflits', (req, res) => {
  console.log(req.query);
  templateService.checkConflits(1, req.service)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.sendStatus(400).json(err);
    });
});


export default router;
