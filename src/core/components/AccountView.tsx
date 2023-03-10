import { Button, Card, Container, Grid, Input, Link, Loading, Row, Spacer, Text, Tooltip } from "@nextui-org/react"
import { FC } from "react"
import { useForm } from "react-hook-form"
import { joiResolver } from "@hookform/resolvers/joi"
import Joi from "joi"
import Web3 from "web3"
import { ChevronLeft } from "react-iconly"
import { erc20ABI, useAccount, useBalance, useDisconnect, useSigner } from "wagmi"
import Profile from "./account/Profile"
import ListView from "./transactions/ListView"
import { getContract } from "@wagmi/core"
import { BigNumber } from "ethers"

const schema = Joi.object({
  destinationAccount: Joi.string()
    .required()
    .min(42)
    .max(64)
    .custom((value, helper) => Web3.utils.isAddress(value) ? value : "")
    .label("Destination Account"),
  amount: Joi.number().required().min(0.3).max(99)
})

const AccountView: FC<{ setSourceAccount: any }> = ({
                                                      setSourceAccount
                                                    }) => {
  const {
    register, handleSubmit,
    formState: { errors }
  } = useForm<{ destinationAccount: string, amount: number }>({
    resolver: joiResolver(schema)
  })

  const { data: signer, isError, isLoading } = useSigner({ chainId: 5 })
  const { address, connector, isConnected } = useAccount()
  const { data: blcData } = useBalance({
    address,
    cacheTime: 2000,
    token: "0xE72c69b02B4B134fb092d0D083B287cf595ED1E6"
  })
  const { disconnect } = useDisconnect()
  if (!isConnected) return <Loading>Loading</Loading>
  const clearSourceAddress = () => {
    disconnect()
    setSourceAccount("")
  }
  const sendTransction = async (destAccount: string, amount: number) => {
    if (BigNumber.from(blcData?.value || 0) < BigNumber.from(amount)) {
      alert("no budget")
      return
    } else {
      const data = await getContract({
        address: "0xE72c69b02B4B134fb092d0D083B287cf595ED1E6",
        abi: erc20ABI,
        "signerOrProvider": signer as any
      })
      const { hash } = await data?.transfer(`0x${destAccount.slice(2, destAccount.length)}`, BigNumber.from(amount * 1000000))
      console.log(`We rook hash - ${hash}`)
      alert("sent transaction")
    }
  }

  const onSubmit = handleSubmit((data) => sendTransction(data.destinationAccount, data.amount))
  return (<>
    <Container justify="center">
      <Row>
        <Tooltip content={"Back to setup source address"} placement={"rightStart"} rounded color="primary">
          <Link onClick={clearSourceAddress}>
            <ChevronLeft set="bulk" primaryColor="blueviolet" />
          </Link>
        </Tooltip>
      </Row>
      <Spacer y={0.5} />
      <Row>
        <Container md>
          <Card>
            <Card.Body>
              <Grid.Container gap={2} justify="center">
                <Grid xs={4}>
                  <Profile />
                </Grid>
                <Grid xs={4}>
                  <ListView />
                </Grid>
                <Grid xs={4}>
                  <form onSubmit={onSubmit}>
                    <Grid.Container gap={2} justify="center">
                      <Grid xs={6}>
                        <Text>Account Source</Text>
                      </Grid>
                      <Grid xs={6}>
                        <Input {...register("destinationAccount")}
                               clearable
                               underlined
                               helperText={"ETH Dest Address to sent "}
                               width="250px" status="default" color="primary"
                               labelLeft="ADR " placeholder="0xfb0a9d38c4dc5...9ce21aa0e5c0c586b" />
                      </Grid>
                    </Grid.Container>
                    <Grid.Container gap={2} justify="center">
                      <Grid xs={6}>
                        <Text>Amount</Text>
                      </Grid>
                      <Grid xs={6}>
                        <Input {...register("amount")}
                               clearable
                               underlined
                               helperText={"ETH amount "}
                               width="250px" status="default" color="primary"
                               labelLeft="ETH " placeholder="0.5" />
                      </Grid>
                    </Grid.Container>
                    <Spacer y={1} />
                    {errors?.destinationAccount &&
                      <Grid.Container gap={2} justify="center">
                        <Grid xs={12} sm>
                          <Text color="error" size="$xs">{errors?.destinationAccount?.message}</Text>
                        </Grid>
                      </Grid.Container>
                    }
                    {errors?.amount &&
                      <Grid.Container gap={2} justify="center">
                        <Grid xs={12} sm>
                          <Text color="error" size="$xs">{errors?.amount?.message}</Text>
                        </Grid>
                      </Grid.Container>
                    }
                    <Grid.Container gap={2} justify="center">
                      <Grid xs={12} direction={"row-reverse"} sm>
                        <Tooltip content={"Setup Source Account"} rounded placement={"bottomEnd"}>
                          <Button type="submit" auto color="primary" rounded css={{
                            width: 150,
                            align: "right"
                          }}>
                            Save
                          </Button>
                        </Tooltip>
                      </Grid>
                    </Grid.Container>
                  </form>
                </Grid>
              </Grid.Container>
            </Card.Body>
          </Card>
        </Container>
      </Row>
    </Container>
  </>)
}
export default AccountView

