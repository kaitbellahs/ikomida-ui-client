<script lang="ts">
  import { Views, Utils, Stores } from '@ikomida/shared-frontend'
  import { onMount } from 'svelte'

  //TODO: -- implement CPush class
  let items: any[]

  onMount(async () => {
    Stores.Loading.instance.stop()
  })

  Stores.Title.instance.set('Mensagens')
</script>

<Views.Divider />
<Views.LoadMoreReusableList
  noItems="Não há mensagens para exibir por enquanto!"
  cache={Stores.Cache.Types.PUSH_NOTIFICATIONS}
  url="/pushNotifications"
  let:index
  bind:items
>
  <article>
    <h2>{items[index].title ?? ''}</h2>
    <div>{items[index].body ?? ''}</div>
    <div>
      {Utils.Strings.dateToString(items[index].createdAt)}
    </div>
  </article>
</Views.LoadMoreReusableList>

<style>
  article {
    position: relative;
    border-radius: 8pt;
    padding: 16pt;
  }
</style>
