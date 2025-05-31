export default function NotFound() {
  return (
    <>
      <div className="page_404_content">
          <span className="page_404_span_warning">УПС!</span>
          <span className="page_error">Ошибка - 404</span>
          <span className="page_404_span">Страница, на которую вы попали, отсутствует или временно в разработке</span>
          <a className="page_404_url" href="/">На главную</a>
      </div>
    </>
  );
}