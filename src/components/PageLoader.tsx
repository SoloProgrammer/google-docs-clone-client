const PageLoader = () => {
  return (
    <div className="z-10 min-h-screen w-full fixed top-0 left-0 bg-white flex items-center justify-center">
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
    src="loading.gif"
    alt="loading"
  />
);

export default PageLoader;
