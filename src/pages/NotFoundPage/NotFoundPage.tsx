import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../app/routes';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found · Atria';
  }, []);

  return (
    <main className={styles.notFound}>
      <section>
        <p className="eyebrow">Lost signal</p>
        <h1>Page not found</h1>
        <span>This part of Atria does not exist or may have moved.</span>
        <div>
          <Link className={styles.primaryLink} to={routes.today}>Go to Today</Link>
          <Link className={styles.secondaryLink} to={routes.calendar}>Open calendar</Link>
        </div>
      </section>
    </main>
  );
}
