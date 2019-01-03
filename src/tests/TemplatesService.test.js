import templateService from '../services/TemplatesService';
import db from '../db/index';

// eslint-disable-next-line no-undef
test('Test the query functions', () => {
  // eslint-disable-next-line no-undef
  db.query = jest.fn().mockResolvedValue({
    rows: [{ template_id: 1, conflit: 2 },
      { template_id: 1, conflit: 3 },
      { template_id: 1, conflit: 4 },
      { template_id: 1, conflit: 5 },
      { template_id: 1, conflit: 6 },
      { template_id: 1, conflit: 7 },
      { template_id: 1, conflit: 8 },
      { template_id: 1, conflit: 9 },
      { template_id: 1, conflit: 10 }],
  });

  templateService.checkConflits(1, 'admin')
    .then((data) => {
      // eslint-disable-next-line no-undef
      expect(data).toMatchObject({
        1: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      });
    });

  templateService.checkConflits(undefined, 'admin')
    .then((data) => {
      // eslint-disable-next-line no-undef
      expect(data).toMatchObject({
        1: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      });
    });


  // eslint-disable-next-line no-undef
  db.query = jest.fn().mockRejectedValue({
    query: 'data not found',
  });

  templateService.checkConflits(undefined, 'admin')
    .catch((err) => {
      // eslint-disable-next-line no-undef
      expect(err).toMatchObject({
        query: 'data not found',
      });
    });

  // eslint-disable-next-line no-undef
  db.query = 1;

  templateService.checkConflits(undefined, 'admin')
    .catch((err) => {
      // eslint-disable-next-line no-undef
      expect(err).toBeInstanceOf(Error);
    });
});
