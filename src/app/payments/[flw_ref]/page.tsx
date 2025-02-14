import Otp from "@/components/Otp";

type OtpProps = {
  params: {
    flw_ref: string
  }
}


export default async function OtpPage({ params }: OtpProps) {
  const { flw_ref } = await params
  return (
    <>
      <div className="max-w-lg mx-auto p-6">
      <Otp flw_ref = {flw_ref}/>
      </div>
    </>
  );


}