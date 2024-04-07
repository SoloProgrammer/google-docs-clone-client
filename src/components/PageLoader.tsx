const PageLoader = () => {
  return (
    <div className="z-10 min-h-screen w-full fixed top-0 left-0 bg-[#f7f7f7] flex items-center justify-center">
      <Loader />
    </div>
  );
};

type LoaderProps = {
  w?: number | string;
};
export const Loader = ({ w = 150 }: LoaderProps) => (
  <img
    width={w}
    src="https://sarabloxsomemotiongraphics.files.wordpress.com/2018/09/google-loading-gif-11.gif"
    alt="loading"
  />
);

export default PageLoader;
