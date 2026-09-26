import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Container,
  TextField,
  Button,
} from '@mui/material';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import SlidingTabPanels from '../common/components/SlidingTabPanels';
import { useCatchCallback } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const SharePage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { type, id } = useParams();

  const item = useSelector((state) =>
    type === 'group' ? state.groups.items[id] : state.devices.items[id],
  );

  const [expiration, setExpiration] = useState(() =>
    dayjs().add(1, 'week').locale('en').format('YYYY-MM-DDTHH:mm'),
  );
  const [link, setLink] = useState();

  const handleShare = useCatchCallback(async () => {
    const expirationTime = dayjs(expiration).toISOString();
    const response = await fetchOrThrow(`/api/share/${type}`, {
      method: 'POST',
      body: new URLSearchParams(`${type}Id=${id}&expiration=${expirationTime}`),
    });
    const token = await response.text();
    setLink(`${window.location.origin}?token=${token}`);
  }, [id, expiration, type, setLink]);

  const tabs = [
    {
      id: 'required',
      label: t('sharedRequired'),
      content: (
        <div className={classes.details}>
          <TextField
            value={item.name}
            label={t(type === 'group' ? 'groupDialog' : 'sharedDevice')}
            disabled
          />
          <TextField
            label={t('userExpirationTime')}
            type="datetime-local"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
          />
          <Button variant="outlined" color="primary" onClick={handleShare}>
            {t('reportShow')}
          </Button>
          <TextField
            value={link || ''}
            onChange={(e) => setLink(e.target.value)}
            label={t('sharedLink')}
            slotProps={{ input: { readOnly: true } }}
          />
        </div>
      ),
    },
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedShare']}>
      <Container maxWidth="xs" className={classes.container}>
        <SlidingTabPanels tabs={tabs} />
        <div className={classes.buttons}>
          <Button type="button" color="primary" variant="outlined" onClick={() => navigate(-1)}>
            {t('sharedCancel')}
          </Button>
          <Button
            type="button"
            color="primary"
            variant="contained"
            onClick={() => navigator.clipboard?.writeText(link)}
            disabled={!link}
          >
            {t('sharedCopy')}
          </Button>
        </div>
      </Container>
    </PageLayout>
  );
};

export default SharePage;
